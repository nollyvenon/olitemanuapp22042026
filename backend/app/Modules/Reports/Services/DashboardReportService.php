<?php

namespace App\Modules\Reports\Services;

use Illuminate\Support\Facades\DB;

class DashboardReportService
{
    public function inventorySummary(): array
    {
        $rows = DB::table('stock_ledgers as sl')
            ->join('stock_items as si', 'sl.item_id', '=', 'si.id')
            ->join('stock_groups as sg', 'si.group_id', '=', 'sg.id')
            ->join('stock_categories as sc', 'sg.category_id', '=', 'sc.id')
            ->join('locations as l', 'sl.location_id', '=', 'l.id')
            ->where('si.is_active', true)
            ->select(
                'si.id',
                'si.sku as code',
                'si.name',
                'sc.name as category',
                'l.name as store',
                'sl.quantity as qty',
                'si.reorder_level as reorder',
                'si.unit_cost',
                DB::raw('(sl.quantity * si.unit_cost) as stock_value')
            )
            ->orderBy('si.name')
            ->get();

        return $rows->map(function ($r) {
            $qty = (float) $r->qty;
            $reorder = (float) $r->reorder;
            $status = $qty <= 0 ? 'out_of_stock' : ($qty <= $reorder ? 'low_stock' : 'active');
            return [
                'id' => $r->id,
                'code' => $r->code,
                'name' => $r->name,
                'category' => $r->category,
                'store' => $r->store,
                'qty' => $qty,
                'reorder' => $reorder,
                'unit_cost' => (float) $r->unit_cost,
                'stock_value' => (float) $r->stock_value,
                'status' => $status,
            ];
        })->all();
    }

    public function movements(?string $from = null, ?string $to = null): array
    {
        $q = DB::table('stock_journals as sj')
            ->join('stock_items as si', 'sj.item_id', '=', 'si.id')
            ->leftJoin('locations as lf', 'sj.from_location', '=', 'lf.id')
            ->leftJoin('locations as lt', 'sj.to_location', '=', 'lt.id')
            ->select(
                'sj.id',
                'sj.type',
                'sj.quantity',
                'sj.journal_date',
                'sj.created_at',
                'si.name as item',
                'lf.name as from_name',
                'lt.name as to_name'
            )
            ->orderByDesc(DB::raw('COALESCE(sj.journal_date, DATE(sj.created_at))'));

        if ($from) {
            $q->whereRaw('COALESCE(sj.journal_date, DATE(sj.created_at)) >= ?', [$from]);
        }
        if ($to) {
            $q->whereRaw('COALESCE(sj.journal_date, DATE(sj.created_at)) <= ?', [$to]);
        }

        return $q->limit(1000)->get()->map(function ($r) {
            $type = match ($r->type) {
                'add', 'return' => 'Receipt',
                'remove', 'sales' => 'Issue',
                'transfer' => 'Transfer',
                default => 'Adjustment',
            };
            $in = in_array($r->type, ['add', 'return'], true) ? (float) $r->quantity : 0;
            $out = in_array($r->type, ['remove', 'sales', 'transfer'], true) ? (float) $r->quantity : 0;
            $store = $r->to_name ?? $r->from_name ?? '—';
            $date = $r->journal_date ?? $r->created_at;
            return [
                'id' => $r->id,
                'ref' => substr($r->id, 0, 8),
                'item' => $r->item,
                'type' => $type,
                'store' => $store,
                'qty_in' => $in,
                'qty_out' => $out,
                'balance' => 0,
                'date' => $date,
            ];
        })->all();
    }

    public function aging(): array
    {
        $accounts = DB::table('ledger_accounts')
            ->where('is_active', true)
            ->whereIn('type', ['debtor', 'creditor'])
            ->get(['id', 'account_number', 'name', 'type', 'customer_id', 'current_balance']);

        $invoices = DB::table('invoices')
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->whereNull('deleted_at')
            ->get(['customer_id', 'total', 'due_date']);

        $byCustomer = [];
        foreach ($invoices as $inv) {
            $byCustomer[$inv->customer_id][] = $inv;
        }

        $today = now()->startOfDay();
        $out = [];
        foreach ($accounts as $la) {
            $buckets = ['current' => 0.0, 'days_30' => 0.0, 'days_60' => 0.0, 'days_90' => 0.0, 'days_90_plus' => 0.0];
            foreach ($byCustomer[$la->customer_id] ?? [] as $inv) {
                $amt = (float) $inv->total;
                $due = $inv->due_date ? \Carbon\Carbon::parse($inv->due_date)->startOfDay() : $today;
                if ($due->gte($today)) {
                    $buckets['current'] += $amt;
                } else {
                    $od = $due->diffInDays($today);
                    if ($od <= 30) {
                        $buckets['days_30'] += $amt;
                    } elseif ($od <= 60) {
                        $buckets['days_60'] += $amt;
                    } elseif ($od <= 90) {
                        $buckets['days_90'] += $amt;
                    } else {
                        $buckets['days_90_plus'] += $amt;
                    }
                }
            }
            $total = array_sum($buckets);
            if ($total <= 0 && (float) $la->current_balance > 0) {
                $buckets['current'] = (float) $la->current_balance;
                $total = $buckets['current'];
            }
            $out[] = [
                'id' => $la->id,
                'account' => $la->account_number,
                'name' => $la->name,
                'type' => $la->type === 'creditor' ? 'Creditor' : 'Debtor',
                'current' => $buckets['current'],
                'days_30' => $buckets['days_30'],
                'days_60' => $buckets['days_60'],
                'days_90' => $buckets['days_90'],
                'days_90_plus' => $buckets['days_90_plus'],
                'total' => $total,
            ];
        }
        return $out;
    }
}
