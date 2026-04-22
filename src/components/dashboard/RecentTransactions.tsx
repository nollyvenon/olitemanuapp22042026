'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { DataTable } from '@/components/data-table/DataTable';

type TxStatus = 'approved' | 'pending' | 'rejected' | 'processing';

interface Transaction {
  id: string;
  customer: string;
  amount: number;
  status: TxStatus;
  date: string;
  highlight?: boolean;
}

const TRANSACTIONS: Transaction[] = [
  { id: 'TXN-00841', customer: 'Apex Steel Ltd',       amount: 284500, status: 'approved',   date: '2026-04-22', highlight: true },
  { id: 'TXN-00840', customer: 'Nova Chemicals',        amount: 91200,  status: 'pending',    date: '2026-04-22' },
  { id: 'TXN-00839', customer: 'Crestline Industries',  amount: 512000, status: 'approved',   date: '2026-04-21', highlight: true },
  { id: 'TXN-00838', customer: 'Greenfield Agro',       amount: 37800,  status: 'rejected',   date: '2026-04-21' },
  { id: 'TXN-00837', customer: 'Pinnacle Exports',      amount: 198400, status: 'processing', date: '2026-04-20' },
  { id: 'TXN-00836', customer: 'BlueTech Fabricators',  amount: 64300,  status: 'pending',    date: '2026-04-20' },
  { id: 'TXN-00835', customer: 'Meridian Logistics',    amount: 430700, status: 'approved',   date: '2026-04-19', highlight: true },
  { id: 'TXN-00834', customer: 'Sunridge Mining Co',    amount: 22100,  status: 'rejected',   date: '2026-04-19' },
  { id: 'TXN-00833', customer: 'Fortis Polymers',       amount: 156800, status: 'approved',   date: '2026-04-18' },
  { id: 'TXN-00832', customer: 'Delta Agro Supplies',   amount: 78500,  status: 'processing', date: '2026-04-18' },
];

const STATUS_STYLES: Record<TxStatus, { bg: string; color: string; label: string }> = {
  approved:   { bg: '#e8f8f5', color: '#067d62', label: 'Approved' },
  pending:    { bg: '#fff8e7', color: '#c45500', label: 'Pending' },
  rejected:   { bg: '#fdecea', color: '#cc0c39', label: 'Rejected' },
  processing: { bg: '#e8f0fe', color: '#146eb4', label: 'Processing' },
};

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc')  return <ArrowUp className="ml-1 h-3 w-3 inline" />;
  if (sorted === 'desc') return <ArrowDown className="ml-1 h-3 w-3 inline" />;
  return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-40" />;
}

function SortableHeader({ column, label }: { column: any; label: string }) {
  return (
    <button
      className="flex items-center text-left"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <SortIcon sorted={column.getIsSorted()} />
    </button>
  );
}

const COLUMNS: ColumnDef<Transaction, any>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <SortableHeader column={column} label="Transaction ID" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold" style={{ color: '#146eb4' }}>
        {row.original.id}
        {row.original.highlight && (
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: '#FF990020', color: '#FF9900' }}>
            HIGH VALUE
          </span>
        )}
      </span>
    ),
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => <SortableHeader column={column} label="Customer" />,
    cell: ({ getValue }) => <span className="font-medium text-sm" style={{ color: '#0f1111' }}>{String(getValue())}</span>,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <SortableHeader column={column} label="Amount" />,
    cell: ({ row }) => (
      <span className="font-bold tabular-nums" style={{ color: row.original.highlight ? '#FF9900' : '#0f1111' }}>
        {fmt(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equals',
    cell: ({ getValue }) => {
      const s = getValue() as TxStatus;
      const st = STATUS_STYLES[s];
      return (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
          {st.label}
        </span>
      );
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => <SortableHeader column={column} label="Date" />,
    cell: ({ getValue }) => (
      <span className="text-xs tabular-nums" style={{ color: '#767676' }}>
        {new Date(String(getValue())).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    ),
  },
];

const STATUSES: TxStatus[] = ['approved', 'pending', 'rejected', 'processing'];

export function RecentTransactions() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [activeStatus, setActiveStatus] = useState<TxStatus | 'all'>('all');

  const filtered = useMemo(
    () => activeStatus === 'all' ? TRANSACTIONS : TRANSACTIONS.filter(t => t.status === activeStatus),
    [activeStatus]
  );

  return (
    <section className="space-y-0">
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #d5d9d9' }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#232f3e' }}>
          <span className="font-semibold text-sm" style={{ color: '#FF9900' }}>Recent Transactions</span>
          <div className="flex gap-1">
            {(['all', ...STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className="px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors"
                style={activeStatus === s
                  ? { background: '#FF9900', color: '#0f1111' }
                  : { background: '#37475a', color: '#aab7c4' }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <DataTable
            columns={COLUMNS}
            data={filtered}
            sorting={sorting}
            onSortingChange={setSorting}
            onRowClick={(row) => router.push(`/dashboard/sales/orders/${row.id}`)}
          />
        </div>
      </div>
    </section>
  );
}
