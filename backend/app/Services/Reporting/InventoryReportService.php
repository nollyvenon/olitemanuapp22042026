<?php
namespace App\Services\Reporting;
use Illuminate\Support\Facades\DB;

class InventoryReportService
{
    public function getInventoryReport(array $filters)
    {
        $startDate = $filters['start_date'] ?? now()->startOfMonth();
        $endDate = $filters['end_date'] ?? now();
        $storeCenterId = $filters['store_center_id'] ?? null;
        $categoryId = $filters['category_id'] ?? null;
        $groupId = $filters['group_id'] ?? null;
        $itemId = $filters['item_id'] ?? null;
        $excludeZero = $filters['exclude_zero'] ?? false;
        $transactionOnly = $filters['transaction_only'] ?? false;

        $query = DB::table('stock_items AS si')
            ->select(
                'si.id',
                'si.name',
                'si.code',
                'sg.name AS group_name',
                'sc.name AS category_name',
                DB::raw('COALESCE(SUM(CASE WHEN sl.store_center_id = ? THEN sl.quantity ELSE 0 END), 0) as opening_balance'),
                DB::raw('COALESCE(SUM(CASE WHEN sj.type = \'add\' AND sj.journal_date < ? THEN sj.quantity ELSE 0 END), 0) as inwards'),
                DB::raw('COALESCE(SUM(CASE WHEN sj.type IN (\'transfer\', \'one_way\') AND sj.from_store_id = ? AND sj.journal_date < ? THEN sj.quantity ELSE 0 END), 0) as outwards'),
                DB::raw('COALESCE(SUM(CASE WHEN sl.store_center_id = ? THEN sl.quantity ELSE 0 END), 0) as closing_balance')
            )
            ->leftJoin('stock_groups AS sg', 'si.group_id', '=', 'sg.id')
            ->leftJoin('stock_categories AS sc', 'sg.category_id', '=', 'sc.id')
            ->leftJoin('stock_ledgers AS sl', 'si.id', '=', 'sl.stock_item_id')
            ->leftJoin('stock_journals AS sj', 'si.id', '=', 'sj.stock_item_id');

        $bindings = [$storeCenterId, $startDate, $storeCenterId, $startDate, $storeCenterId];

        if ($categoryId) {
            $query->where('sc.id', $categoryId);
        }
        if ($groupId) {
            $query->where('sg.id', $groupId);
        }
        if ($itemId) {
            $query->where('si.id', $itemId);
        }

        $query->groupBy('si.id', 'si.name', 'si.code', 'sg.name', 'sc.name');

        if ($excludeZero) {
            $query->havingRaw('COALESCE(SUM(CASE WHEN sl.store_center_id = ? THEN sl.quantity ELSE 0 END), 0) > 0', [$storeCenterId]);
        }

        return $query->get();
    }

    public function getDetailedMovements(array $filters)
    {
        $startDate = $filters['start_date'] ?? now()->startOfMonth();
        $endDate = $filters['end_date'] ?? now();
        $itemId = $filters['item_id'];
        $storeCenterId = $filters['store_center_id'];

        return DB::table('stock_journals')
            ->select('id', 'type', 'quantity', 'journal_date', 'remarks', 'created_by', 'from_store_id', 'to_store_id')
            ->where('stock_item_id', $itemId)
            ->where(function ($q) use ($storeCenterId) {
                $q->where('to_store_id', $storeCenterId)
                  ->orWhere('from_store_id', $storeCenterId);
            })
            ->whereBetween('journal_date', [$startDate, $endDate])
            ->orderBy('journal_date')
            ->get();
    }
}
