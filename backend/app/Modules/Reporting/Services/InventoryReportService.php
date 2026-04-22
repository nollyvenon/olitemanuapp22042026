<?php

namespace App\Modules\Reporting\Services;

use Illuminate\Support\Facades\DB;
use App\Models\InventoryReport;

class InventoryReportService {
    public function openingBalance(string $locationId, ?string $categoryId, ?string $itemId, string $date): array {
        return DB::table('stock_ledgers as sl')
            ->selectRaw('sl.item_id, si.name, sc.name as category, sl.quantity, (sl.quantity * pl.price) as total_value')
            ->leftJoin('stock_items as si', 'sl.item_id', '=', 'si.id')
            ->leftJoin('stock_categories as sc', 'si.category_id', '=', 'sc.id')
            ->leftJoin('price_list_items as pl', 'si.id', '=', 'pl.item_id')
            ->where('sl.location_id', $locationId)
            ->when($categoryId, fn($q) => $q->where('sc.id', $categoryId))
            ->when($itemId, fn($q) => $q->where('sl.item_id', $itemId))
            ->where('pl.version_id', function($q) { $q->selectRaw('id')->from('price_list_versions')->where('is_current', true)->limit(1); })
            ->get()
            ->toArray();
    }

    public function inwardsMovement(string $locationId, ?string $categoryId, ?string $itemId, string $fromDate, string $toDate): array {
        return DB::table('stock_journals as sj')
            ->selectRaw('sj.item_id, si.name, sc.name as category, SUM(sj.quantity) as total_qty, COUNT(*) as transaction_count')
            ->leftJoin('stock_items as si', 'sj.item_id', '=', 'si.id')
            ->leftJoin('stock_categories as sc', 'si.category_id', '=', 'sc.id')
            ->where('sj.location_id', $locationId)
            ->whereIn('sj.movement_type', ['add', 'transfer_in'])
            ->whereBetween('sj.created_at', [$fromDate, $toDate])
            ->when($categoryId, fn($q) => $q->where('sc.id', $categoryId))
            ->when($itemId, fn($q) => $q->where('sj.item_id', $itemId))
            ->groupBy('sj.item_id', 'si.name', 'sc.name')
            ->havingRaw('SUM(sj.quantity) > 0')
            ->get()
            ->toArray();
    }

    public function outwardsMovement(string $locationId, ?string $categoryId, ?string $itemId, string $fromDate, string $toDate): array {
        return DB::table('stock_journals as sj')
            ->selectRaw('sj.item_id, si.name, sc.name as category, SUM(sj.quantity) as total_qty, COUNT(*) as transaction_count')
            ->leftJoin('stock_items as si', 'sj.item_id', '=', 'si.id')
            ->leftJoin('stock_categories as sc', 'si.category_id', '=', 'sc.id')
            ->where('sj.location_id', $locationId)
            ->whereIn('sj.movement_type', ['remove', 'transfer_out'])
            ->whereBetween('sj.created_at', [$fromDate, $toDate])
            ->when($categoryId, fn($q) => $q->where('sc.id', $categoryId))
            ->when($itemId, fn($q) => $q->where('sj.item_id', $itemId))
            ->groupBy('sj.item_id', 'si.name', 'sc.name')
            ->havingRaw('SUM(sj.quantity) > 0')
            ->get()
            ->toArray();
    }

    public function closingBalance(string $locationId, ?string $categoryId, ?string $itemId, string $date): array {
        return DB::table('stock_ledgers as sl')
            ->selectRaw('sl.item_id, si.name, sc.name as category, sl.quantity, (sl.quantity * pl.price) as total_value')
            ->leftJoin('stock_items as si', 'sl.item_id', '=', 'si.id')
            ->leftJoin('stock_categories as sc', 'si.category_id', '=', 'sc.id')
            ->leftJoin('price_list_items as pl', 'si.id', '=', 'pl.item_id')
            ->where('sl.location_id', $locationId)
            ->when($categoryId, fn($q) => $q->where('sc.id', $categoryId))
            ->when($itemId, fn($q) => $q->where('sl.item_id', $itemId))
            ->where('pl.version_id', function($q) { $q->selectRaw('id')->from('price_list_versions')->where('is_current', true)->limit(1); })
            ->where('sl.quantity', '>', 0)
            ->get()
            ->toArray();
    }
}
