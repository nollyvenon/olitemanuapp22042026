import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  draft:         { bg: '#f4f6f8', color: '#555555' },
  submitted:     { bg: '#e8f0fe', color: '#146eb4' },
  approved:      { bg: '#e8f8f5', color: '#067d62' },
  rejected:      { bg: '#fdecea', color: '#cc0c39' },
  pending:       { bg: '#fff8e7', color: '#c45500' },
  processing:    { bg: '#e8f0fe', color: '#146eb4' },
  completed:     { bg: '#e8f8f5', color: '#067d62' },
  cancelled:     { bg: '#f4f6f8', color: '#767676' },
  paid:          { bg: '#e8f8f5', color: '#067d62' },
  overdue:       { bg: '#fdecea', color: '#cc0c39' },
  low_stock:     { bg: '#fff8e7', color: '#c45500' },
  out_of_stock:  { bg: '#fdecea', color: '#cc0c39' },
  active:        { bg: '#e8f8f5', color: '#067d62' },
  inactive:      { bg: '#f4f6f8', color: '#767676' },
  suspended:     { bg: '#fdecea', color: '#cc0c39' },
  verified:      { bg: '#e8f8f5', color: '#067d62' },
  unverified:    { bg: '#fff8e7', color: '#c45500' },
  credit:        { bg: '#e8f0fe', color: '#146eb4' },
  debit:         { bg: '#fff8e7', color: '#c45500' },
  posted:        { bg: '#e8f8f5', color: '#067d62' },
  voided:        { bg: '#fdecea', color: '#cc0c39' },
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected',
  pending: 'Pending', processing: 'Processing', completed: 'Completed', cancelled: 'Cancelled',
  paid: 'Paid', overdue: 'Overdue', low_stock: 'Low Stock', out_of_stock: 'Out of Stock',
  active: 'Active', inactive: 'Inactive', suspended: 'Suspended', verified: 'Verified',
  unverified: 'Unverified', credit: 'Credit', debit: 'Debit', posted: 'Posted', voided: 'Voided',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status?.toLowerCase().replace(/[\s-]+/g, '_') || 'draft';
  const style = STATUS_STYLES[key] ?? { bg: '#f4f6f8', color: '#555555' };
  const text = label ?? STATUS_LABELS[key] ?? status;
  return (
    <span
      className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', className)}
      style={{ background: style.bg, color: style.color }}
    >
      {text}
    </span>
  );
}
