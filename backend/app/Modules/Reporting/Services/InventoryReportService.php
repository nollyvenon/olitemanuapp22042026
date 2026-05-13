<?php

namespace App\Modules\Reporting\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Query\Builder;

class InventoryReportService {
    public function unified(array $filters): array {
        $loc = $filters['location_id'];
        $from = $filters['from'];
        $to = $filters['to'];
        $categoryId = $filters['category_id'] ?? null;
        $groupId = $filters['group_id'] ?? null;
        $itemId = $filters['item_id'] ?? null;
        $excludeZero = !empty($filters['exclude_zero']);
        $transactionOnly = !empty($filters['transaction_only']);

        $aggSub = DB::table('stock_journals as sj')
            ->selectRaw(
                'sj.item_id,
                SUM(CASE WHEN COALESCE(sj.journal_date, DATE(sj.created_at)) < ? AND sj.to_location = ? AND sj.type IN (\'add\',\'transfer\',\'return\') THEN sj.quantity
                         WHEN COALESCE(sj.journal_date, DATE(sj.created_at)) < ? AND sj.from_location = ? AND sj.type IN (\'remove\',\'transfer\',\'sales\') THEN -sj.quantity
                         ELSE 0 END) AS opening_balance,
                SUM(CASE WHEN COALESCE(sj.journal_date, DATE(sj.created_at)) BETWEEN ? AND ? AND sj.to_location = ? AND sj.type IN (\'add\',\'transfer\',\'return\') THEN sj.quantity ELSE 0 END) AS inwards,
                SUM(CASE WHEN COALESCE(sj.journal_date, DATE(sj.created_at)) BETWEEN ? AND ? AND sj.from_location = ? AND sj.type IN (\'remove\',\'transfer\',\'sales\') THEN sj.quantity ELSE 0 END) AS outwards',
                [$from, $loc, $from, $loc, $from, $to, $loc, $from, $to, $loc]
            )
            ->groupBy('sj.item_id');

        $q = DB::table('stock_items as si')
            ->join('stock_groups as sg', 'si.group_id', '=', 'sg.id')
            ->join('stock_categories as sc', 'sg.category_id', '=', 'sc.id')
            ->leftJoinSub($aggSub, 'agg', 'agg.item_id', '=', 'si.id')
            ->selectRaw(
                'si.id, si.sku, si.name, sc.name as category_name, sg.name as group_name,
                COALESCE(agg.opening_balance,0) as opening_balance,
                COALESCE(agg.inwards,0) as inwards,
                COALESCE(agg.outwards,0) as outwards,
                COALESCE(agg.opening_balance,0) + COALESCE(agg.inwards,0) - COALESCE(agg.outwards,0) as closing_balance'
            )
            ->when($categoryId, fn (Builder $b) => $b->where('sc.id', $categoryId))
            ->when($groupId, fn (Builder $b) => $b->where('sg.id', $groupId))
            ->when($itemId, fn (Builder $b) => $b->where('si.id', $itemId));

        if ($excludeZero) {
            $q->havingRaw('COALESCE(agg.opening_balance,0) + COALESCE(agg.inwards,0) - COALESCE(agg.outwards,0) != 0');
        }
        if ($transactionOnly) {
            $q->havingRaw('(COALESCE(agg.inwards,0) != 0 OR COALESCE(agg.outwards,0) != 0)');
        }

        return $q->orderBy('si.name')->get()->toArray();
    }
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
