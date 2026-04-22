import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const STATUS_CLASSES: Record<string, string> = {
  draft:
    'bg-[oklch(0.95_0.04_260)] text-[oklch(0.35_0.08_260)] border-[oklch(0.85_0.08_260)]',
  submitted:
    'bg-[oklch(0.93_0.12_263)] text-[oklch(0.28_0.18_263)] border-[oklch(0.83_0.15_263)]',
  approved:
    'bg-[oklch(0.93_0.08_142)] text-[oklch(0.22_0.15_142)] border-[oklch(0.83_0.10_142)]',
  rejected:
    'bg-[oklch(0.93_0.19_30)] text-[oklch(0.30_0.22_30)] border-[oklch(0.83_0.22_30)]',
  pending:
    'bg-[oklch(0.93_0.18_70)] text-[oklch(0.28_0.22_70)] border-[oklch(0.83_0.20_70)]',
  processing:
    'bg-[oklch(0.93_0.16_200)] text-[oklch(0.28_0.19_200)] border-[oklch(0.83_0.18_200)]',
  completed:
    'bg-[oklch(0.93_0.08_142)] text-[oklch(0.22_0.15_142)] border-[oklch(0.83_0.10_142)]',
  cancelled:
    'bg-[oklch(0.93_0_0)] text-[oklch(0.28_0_0)] border-[oklch(0.83_0_0)]',
  paid: 'bg-[oklch(0.93_0.08_142)] text-[oklch(0.22_0.15_142)] border-[oklch(0.83_0.10_142)]',
  overdue:
    'bg-[oklch(0.93_0.19_30)] text-[oklch(0.30_0.22_30)] border-[oklch(0.83_0.22_30)]',
  low_stock:
    'bg-[oklch(0.93_0.18_70)] text-[oklch(0.28_0.22_70)] border-[oklch(0.83_0.20_70)]',
  out_of_stock:
    'bg-[oklch(0.93_0.19_30)] text-[oklch(0.30_0.22_30)] border-[oklch(0.83_0.22_30)]',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
  paid: 'Paid',
  overdue: 'Overdue',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

export function StatusBadge({
  status,
  label,
  className,
}: StatusBadgeProps) {
  const key = status?.toLowerCase().replace(/\s+/g, '_') || 'draft';
  const classes = STATUS_CLASSES[key] ?? 'bg-muted text-muted-foreground';
  const displayLabel =
    label ?? STATUS_LABELS[key] ?? status;

  return (
    <Badge
      variant="outline"
      className={cn(
        'border text-xs font-medium rounded-full px-2.5 py-0.5',
        classes,
        className
      )}
    >
      {displayLabel}
    </Badge>
  );
}
