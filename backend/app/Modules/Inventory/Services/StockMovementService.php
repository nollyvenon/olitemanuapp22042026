<?php

namespace App\Modules\Inventory\Services;

use App\Models\StockItem;
use App\Models\StockJournal;
use App\Models\StockLedger;
use Illuminate\Support\Facades\DB;

class StockMovementService {
    public function addStock(string $itemId, string $locationId, float $quantity, string $userId, array $meta = []): StockJournal {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive');
        }

        return DB::transaction(function () use ($itemId, $locationId, $quantity, $userId, $meta) {
            $this->upsertLedger($itemId, $locationId, $quantity);

            return StockJournal::create([
                'item_id' => $itemId,
                'to_location' => $locationId,
                'quantity' => $quantity,
                'type' => $meta['type'] ?? 'add',
                'reference_type' => $meta['reference_type'] ?? null,
                'reference_id' => $meta['reference_id'] ?? null,
                'notes' => $meta['notes'] ?? null,
                'created_by' => $userId,
                'created_at' => now(),
            ]);
        });
    }

    public function removeStock(string $itemId, string $locationId, float $quantity, string $userId, array $meta = []): StockJournal {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive');
        }

        return DB::transaction(function () use ($itemId, $locationId, $quantity, $userId, $meta) {
            $ledger = StockLedger::where('item_id', $itemId)->where('location_id', $locationId)->lockForUpdate()->first();

            if (!$ledger || $ledger->quantity < $quantity) {
                $item = StockItem::find($itemId);
                throw new \Exception("Insufficient stock for {$item?->name} at this location", 422);
            }

            $ledger->decrement('quantity', $quantity);

            return StockJournal::create([
                'item_id' => $itemId,
                'from_location' => $locationId,
                'quantity' => $quantity,
                'type' => $meta['type'] ?? 'remove',
                'reference_type' => $meta['reference_type'] ?? null,
                'reference_id' => $meta['reference_id'] ?? null,
                'notes' => $meta['notes'] ?? null,
                'created_by' => $userId,
                'created_at' => now(),
            ]);
        });
    }

    public function transferStock(string $itemId, string $fromLocationId, string $toLocationId, float $quantity, string $userId, ?string $notes = null): StockJournal {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive');
        }

        if ($fromLocationId === $toLocationId) {
            throw new \InvalidArgumentException('Source and destination locations must differ');
        }

        return DB::transaction(function () use ($itemId, $fromLocationId, $toLocationId, $quantity, $userId, $notes) {
            $fromLedger = StockLedger::where('item_id', $itemId)->where('location_id', $fromLocationId)->lockForUpdate()->first();

            if (!$fromLedger || $fromLedger->quantity < $quantity) {
                $item = StockItem::find($itemId);
                throw new \Exception("Insufficient stock for {$item?->name} at source location", 422);
            }

            $fromLedger->decrement('quantity', $quantity);
            $this->upsertLedger($itemId, $toLocationId, $quantity);

            return StockJournal::create([
                'item_id' => $itemId,
                'from_location' => $fromLocationId,
                'to_location' => $toLocationId,
                'quantity' => $quantity,
                'type' => 'transfer',
                'notes' => $notes,
                'created_by' => $userId,
                'created_at' => now(),
            ]);
        });
    }

    private function upsertLedger(string $itemId, string $locationId, float $delta): void {
        StockLedger::updateOrCreate(
            ['item_id' => $itemId, 'location_id' => $locationId],
            ['quantity' => DB::raw("COALESCE(quantity, 0) + {$delta}")]
        );
    }
}
