<?php namespace App\Modules\Inventory\Services;
use App\Models\StockJournal;
use App\Models\StockJournalItem;
use App\Models\StockBalance;
use App\Models\StockItem;
use Illuminate\Support\Facades\DB;

class StockMovementService {
    public function addStock(array $data): StockJournal {
        return DB::transaction(function () use ($data) {
            $journal = StockJournal::create(['store_center_id' => $data['store_center_id'], 'type' => 'add', 'status' => 'draft', 'notes' => $data['notes'] ?? null, 'created_by' => $data['created_by']]);
            foreach ($data['items'] as $item) {
                StockJournalItem::create(['journal_id' => $journal->id, 'item_id' => $item['item_id'], 'quantity' => $item['quantity'], 'unit_cost' => $item['unit_cost'] ?? 0]);
            }
            return $journal;
        });
    }

    public function transferStock(array $data): StockJournal {
        return DB::transaction(function () use ($data) {
            $fromBalance = StockBalance::where('item_id', $data['item_id'])->where('store_center_id', $data['from_store_id'])->first();
            if (!$fromBalance || $fromBalance->quantity < $data['quantity']) throw new \Exception('Insufficient stock', 422);
            $journal = StockJournal::create(['store_center_id' => $data['to_store_id'], 'from_store_id' => $data['from_store_id'], 'type' => 'transfer', 'status' => 'posted', 'notes' => $data['notes'] ?? null, 'created_by' => $data['created_by'], 'posted_by' => $data['created_by'], 'posted_at' => now()]);
            StockJournalItem::create(['journal_id' => $journal->id, 'item_id' => $data['item_id'], 'quantity' => $data['quantity']]);
            $fromBalance->decrement('quantity', $data['quantity']);
            StockBalance::updateOrCreate(['item_id' => $data['item_id'], 'store_center_id' => $data['to_store_id']], ['quantity' => DB::raw("COALESCE(quantity, 0) + {$data['quantity']}")]);
            return $journal;
        });
    }

    public function postJournal(string $journalId, string $userId): StockJournal {
        return DB::transaction(function () use ($journalId, $userId) {
            $journal = StockJournal::findOrFail($journalId);
            if ($journal->status !== 'draft') throw new \Exception('Only draft journals can be posted', 422);
            foreach ($journal->items as $item) {
                if ($journal->from_store_id) {
                    $fromBalance = StockBalance::where('item_id', $item->item_id)->where('store_center_id', $journal->from_store_id)->first();
                    if (!$fromBalance || $fromBalance->quantity < $item->quantity) throw new \Exception('Insufficient stock', 422);
                    $fromBalance->decrement('quantity', $item->quantity);
                }
                $balance = StockBalance::firstOrCreate(['item_id' => $item->item_id, 'store_center_id' => $journal->store_center_id], ['quantity' => 0]);
                $balance->increment('quantity', $item->quantity);
            }
            return $journal->update(['status' => 'posted', 'posted_by' => $userId, 'posted_at' => now()]) ? $journal->refresh() : $journal;
        });
    }

    public function reverseJournal(string $journalId): StockJournal {
        return DB::transaction(function () use ($journalId) {
            $journal = StockJournal::findOrFail($journalId);
            if ($journal->status !== 'posted') throw new \Exception('Only posted journals can be reversed', 422);
            foreach ($journal->items as $item) {
                StockBalance::where('item_id', $item->item_id)->where('store_center_id', $journal->store_center_id)->decrement('quantity', $item->quantity);
                if ($journal->from_store_id) StockBalance::firstOrCreate(['item_id' => $item->item_id, 'store_center_id' => $journal->from_store_id], ['quantity' => 0])->increment('quantity', $item->quantity);
            }
            return $journal->update(['status' => 'reversed']) ? $journal->refresh() : $journal;
        });
    }
}
