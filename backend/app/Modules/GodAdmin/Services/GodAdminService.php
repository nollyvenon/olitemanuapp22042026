<?php

namespace App\Modules\GodAdmin\Services;

use App\Models\GodModeAction;
use App\Models\GodModeConfirmation;
use App\Models\User;
use App\Models\StockItem;
use App\Models\LedgerAccount;
use App\Models\LedgerEntry;
use App\Models\StockJournal;
use App\Modules\Audit\Services\AuditService;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Storage;
use Exception;

class GodAdminService
{
    public function __construct(private AuditService $auditService) {}

    private const HIGH_RISK_ACTIONS = [
        'DELETE_LEDGER',
        'FORCE_STOCK_NEGATIVE',
        'SUSPEND_USER',
        'PRICE_OVERRIDE_MAJOR',
    ];

    public function override(
        User $godAdmin,
        string $actionType,
        string $module,
        ?string $affectedEntityId,
        ?string $affectedEntityType,
        array $previousState,
        array $newState,
        string $reason,
        ?string $deviceId = null,
        ?string $ipAddress = null
    ): GodModeAction | GodModeConfirmation {
        $this->validateReason($reason);

        $actionData = [
            'god_admin_id' => $godAdmin->id,
            'action_type' => $actionType,
            'module' => $module,
            'affected_entity_id' => $affectedEntityId,
            'affected_entity_type' => $affectedEntityType,
            'previous_state' => $previousState,
            'new_state' => $newState,
            'reason' => $reason,
            'device_id' => $deviceId,
            'ip_address' => $ipAddress,
        ];

        if (in_array($actionType, self::HIGH_RISK_ACTIONS)) {
            $confirmation = GodModeConfirmation::create([
                'god_admin_id' => $godAdmin->id,
                'action_type' => $actionType,
                'reason' => $reason,
                'status' => 'pending',
            ]);

            return $confirmation;
        }

        $action = GodModeAction::create($actionData);
        return $action;
    }

    public function confirmHighRiskAction(string $confirmationId, User $confirmer): void
    {
        $confirmation = GodModeConfirmation::findOrFail($confirmationId);

        if ($confirmation->status !== 'pending') {
            throw new Exception("Confirmation is not in pending status: {$confirmation->status}");
        }

        if ($confirmation->god_admin_id === $confirmer->id) {
            throw new Exception("Original god admin cannot confirm their own high-risk action");
        }

        $confirmation->update([
            'status' => 'confirmed',
            'confirmed_by' => $confirmer->id,
            'confirmed_at' => now(),
        ]);

        $this->executeHighRiskAction($confirmation);
    }

    private function executeHighRiskAction(GodModeConfirmation $confirmation): void
    {
        $originalAdmin = User::find($confirmation->god_admin_id);

        switch ($confirmation->action_type) {
            case 'SUSPEND_USER':
                $userId = $confirmation->reason;
                $this->suspendUserInternal($userId, $originalAdmin);
                break;
            case 'DELETE_LEDGER':
            case 'FORCE_STOCK_NEGATIVE':
            case 'PRICE_OVERRIDE_MAJOR':
                // Execute stored in god_mode_actions after confirmation
                break;
        }
    }

    public function impersonate(User $godAdmin, string $targetUserId, string $reason): string
    {
        $targetUser = User::findOrFail($targetUserId);

        if (!$targetUser->is_active) {
            throw new Exception("Cannot impersonate inactive user");
        }

        GodModeAction::create([
            'god_admin_id' => $godAdmin->id,
            'action_type' => 'IMPERSONATE',
            'module' => 'AUTH',
            'affected_entity_id' => $targetUserId,
            'affected_entity_type' => 'User',
            'reason' => $reason,
            'previous_state' => ['original_user_id' => $godAdmin->id],
            'new_state' => ['impersonated_user_id' => $targetUserId],
        ]);

        $payload = [
            'sub' => $targetUser->id,
            'email' => $targetUser->email,
            'impersonated_session' => true,
            'original_admin' => $godAdmin->id,
            'exp' => now()->addHour()->timestamp,
        ];

        return \Illuminate\Support\Facades\JWT::encode(
            $payload,
            config('app.key'),
            'HS256'
        );
    }

    public function forceStateTransition(
        string $entityType,
        string $entityId,
        string $newState,
        string $reason,
        User $godAdmin
    ): void {
        $this->validateReason($reason);

        $entity = $this->loadEntity($entityType, $entityId);
        $oldState = $entity->status ?? $entity->state ?? null;

        if ($oldState === $newState) {
            throw new Exception("Entity already in state: {$newState}");
        }

        if (method_exists($entity, 'createVersion')) {
            $entity->createVersion();
        }

        $entity->update(['status' => $newState]);

        GodModeAction::create([
            'god_admin_id' => $godAdmin->id,
            'action_type' => 'FORCE_STATE_TRANSITION',
            'module' => $this->mapEntityTypeToModule($entityType),
            'affected_entity_id' => $entityId,
            'affected_entity_type' => $entityType,
            'previous_state' => ['status' => $oldState],
            'new_state' => ['status' => $newState],
            'reason' => $reason,
        ]);

        $this->auditService->log([
            'user_id' => $godAdmin->id,
            'action_type' => 'GOD_MODE_STATE_TRANSITION',
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'before_snapshot' => ['status' => $oldState],
            'after_snapshot' => ['status' => $newState],
            'metadata' => ['reason' => $reason, 'god_mode' => true],
        ]);
    }

    public function suspendUser(string $userId, string $reason, User $godAdmin): void
    {
        $this->validateReason($reason);

        GodModeConfirmation::create([
            'god_admin_id' => $godAdmin->id,
            'action_type' => 'SUSPEND_USER',
            'reason' => $reason,
            'status' => 'pending',
        ]);
    }

    private function suspendUserInternal(string $userId, User $godAdmin): void
    {
        $user = User::findOrFail($userId);

        $user->update(['is_active' => false]);

        \Illuminate\Support\Facades\DB::table('sessions')
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->update(['revoked_at' => now(), 'is_active' => false]);

        GodModeAction::create([
            'god_admin_id' => $godAdmin->id,
            'action_type' => 'SUSPEND_USER',
            'module' => 'AUTH',
            'affected_entity_id' => $userId,
            'affected_entity_type' => 'User',
            'previous_state' => ['is_active' => true],
            'new_state' => ['is_active' => false],
            'reason' => 'User suspended by god admin',
        ]);

        $this->auditService->log([
            'user_id' => $godAdmin->id,
            'action_type' => 'GOD_MODE_SUSPEND_USER',
            'entity_type' => 'User',
            'entity_id' => $userId,
            'after_snapshot' => ['is_active' => false],
            'metadata' => ['god_mode' => true],
        ]);
    }

    public function unsuspendUser(string $userId, string $reason, User $godAdmin): void
    {
        $this->validateReason($reason);

        $user = User::findOrFail($userId);

        $user->update(['is_active' => true]);

        GodModeAction::create([
            'god_admin_id' => $godAdmin->id,
            'action_type' => 'UNSUSPEND_USER',
            'module' => 'AUTH',
            'affected_entity_id' => $userId,
            'affected_entity_type' => 'User',
            'previous_state' => ['is_active' => false],
            'new_state' => ['is_active' => true],
            'reason' => $reason,
        ]);

        $this->auditService->log([
            'user_id' => $godAdmin->id,
            'action_type' => 'GOD_MODE_UNSUSPEND_USER',
            'entity_type' => 'User',
            'entity_id' => $userId,
            'after_snapshot' => ['is_active' => true],
            'metadata' => ['reason' => $reason, 'god_mode' => true],
        ]);
    }

    public function overridePriceOnOrder(
        string $orderId,
        array $lineItemPriceOverrides,
        string $reason,
        User $godAdmin
    ): void {
        $this->validateReason($reason);

        $order = \App\Models\Order::findOrFail($orderId);

        if (in_array($order->status, ['APPROVED', 'REJECTED'])) {
            throw new Exception("Cannot override prices on {$order->status} order");
        }

        $previousPrices = [];
        $newPrices = [];

        foreach ($lineItemPriceOverrides as $override) {
            $lineItem = $order->lineItems()->findOrFail($override['line_item_id']);
            $previousPrices[$lineItem->id] = $lineItem->unit_price;
            $newPrices[$lineItem->id] = $override['new_price'];

            $lineItem->update(['unit_price' => $override['new_price']]);
        }

        if (method_exists($order, 'createVersion')) {
            $order->createVersion();
        }

        GodModeAction::create([
            'god_admin_id' => $godAdmin->id,
            'action_type' => 'PRICE_OVERRIDE',
            'module' => 'SALES',
            'affected_entity_id' => $orderId,
            'affected_entity_type' => 'Order',
            'previous_state' => ['prices' => $previousPrices],
            'new_state' => ['prices' => $newPrices],
            'reason' => $reason,
        ]);

        $this->auditService->log([
            'user_id' => $godAdmin->id,
            'action_type' => 'GOD_MODE_PRICE_OVERRIDE',
            'entity_type' => 'Order',
            'entity_id' => $orderId,
            'before_snapshot' => ['prices' => $previousPrices],
            'after_snapshot' => ['prices' => $newPrices],
            'metadata' => ['reason' => $reason, 'god_mode' => true],
        ]);
    }

    public function overrideInventoryBalance(
        string $itemId,
        string $locationId,
        string $newBalance,
        string $reason,
        User $godAdmin
    ): void {
        $this->validateReason($reason);

        $item = StockItem::findOrFail($itemId);

        $currentBalance = \Illuminate\Support\Facades\DB::table('stock_ledger')
            ->where('item_id', $itemId)
            ->where('location_id', $locationId)
            ->sum('quantity_change');

        $difference = $newBalance - $currentBalance;

        $journal = StockJournal::create([
            'item_id' => $itemId,
            'from_location' => $locationId,
            'to_location' => $locationId,
            'type' => 'god_mode_correction',
            'quantity' => abs($difference),
            'reason' => "GOD MODE: {$reason}",
            'recorded_by' => $godAdmin->id,
        ]);

        \Illuminate\Support\Facades\DB::table('stock_ledger')->insert([
            'id' => \Illuminate\Support\Str::uuid(),
            'item_id' => $itemId,
            'location_id' => $locationId,
            'journal_id' => $journal->id,
            'quantity_change' => $difference,
            'balance_after' => $newBalance,
            'recorded_by' => $godAdmin->id,
            'created_at' => now(),
        ]);

        GodModeAction::create([
            'god_admin_id' => $godAdmin->id,
            'action_type' => 'INVENTORY_OVERRIDE',
            'module' => 'INVENTORY',
            'affected_entity_id' => $itemId,
            'affected_entity_type' => 'StockItem',
            'previous_state' => ['balance' => $currentBalance, 'location_id' => $locationId],
            'new_state' => ['balance' => $newBalance, 'location_id' => $locationId],
            'reason' => $reason,
        ]);

        $this->auditService->log([
            'user_id' => $godAdmin->id,
            'action_type' => 'GOD_MODE_INVENTORY_OVERRIDE',
            'entity_type' => 'StockItem',
            'entity_id' => $itemId,
            'before_snapshot' => ['balance' => $currentBalance],
            'after_snapshot' => ['balance' => $newBalance],
            'metadata' => ['reason' => $reason, 'god_mode' => true, 'location_id' => $locationId],
        ]);
    }

    public function viewVersionHistory(string $entityType, string $entityId): array
    {
        $model = $this->loadEntity($entityType, $entityId);

        if (!method_exists($model, 'versions')) {
            throw new Exception("Entity type {$entityType} does not support versioning");
        }

        $current = $model->toArray();
        $versions = $model->versions()->orderByDesc('version_number')->get();

        $history = [
            [
                'version_number' => $model->version_number ?? 1,
                'is_current' => true,
                'created_at' => $model->updated_at,
                'snapshot' => $current,
            ],
        ];

        foreach ($versions as $version) {
            $history[] = [
                'version_number' => $version->version_number,
                'is_current' => false,
                'parent_id' => $version->parent_id,
                'created_at' => $version->created_at,
                'snapshot' => $version->toArray(),
            ];
        }

        return $history;
    }

    public function viewAuditLog(array $filters = []): Paginator
    {
        $query = GodModeAction::with('godAdmin', 'impersonatedUser')
            ->orderByDesc('created_at');

        if (isset($filters['action_type'])) {
            $query->where('action_type', $filters['action_type']);
        }

        if (isset($filters['module'])) {
            $query->where('module', $filters['module']);
        }

        if (isset($filters['god_admin_id'])) {
            $query->where('god_admin_id', $filters['god_admin_id']);
        }

        if (isset($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        return $query->paginate(50);
    }

    public function exportAuditLog(string $startDate, string $endDate): string
    {
        $actions = GodModeAction::with('godAdmin')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->orderByDesc('created_at')
            ->get();

        $csv = "ID,God Admin,Action Type,Module,Entity Type,Entity ID,Reason,Created At\n";

        foreach ($actions as $action) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s","%s","%s"' . "\n",
                $action->id,
                $action->godAdmin->email ?? 'Unknown',
                $action->action_type,
                $action->module,
                $action->affected_entity_type,
                $action->affected_entity_id,
                str_replace('"', '""', substr($action->reason, 0, 500)),
                $action->created_at->format('Y-m-d H:i:s')
            );
        }

        $filename = 'god_mode_audit_' . now()->format('Y-m-d_His') . '.csv';
        Storage::disk('s3')->put("exports/{$filename}", $csv, 'private');

        return Storage::disk('s3')->temporaryUrl("exports/{$filename}", now()->addHours(24));
    }

    private function validateReason(string $reason): void
    {
        if (strlen($reason) > 500) {
            throw new Exception('Reason must be 500 words or less');
        }

        if (empty(trim($reason))) {
            throw new Exception('Reason is required');
        }
    }

    private function loadEntity(string $entityType, string $entityId)
    {
        return match ($entityType) {
            'Order' => \App\Models\Order::findOrFail($entityId),
            'User' => User::findOrFail($entityId),
            'StockItem' => StockItem::findOrFail($entityId),
            'LedgerAccount' => LedgerAccount::findOrFail($entityId),
            'KycSubmission' => \App\Models\KycSubmission::findOrFail($entityId),
            'MarketPlan' => \App\Models\MarketPlan::findOrFail($entityId),
            default => throw new Exception("Unknown entity type: {$entityType}"),
        };
    }

    private function mapEntityTypeToModule(string $entityType): string
    {
        return match ($entityType) {
            'Order', 'Customer' => 'SALES',
            'StockItem', 'StockCategory' => 'INVENTORY',
            'LedgerAccount', 'Voucher' => 'ACCOUNTS',
            'KycSubmission' => 'KYC',
            'MarketPlan' => 'MARKET_INTELLIGENCE',
            'User' => 'AUTH',
            default => 'SYSTEM',
        };
    }
}
