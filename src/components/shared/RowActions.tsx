'use client';

import { MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface RowActionsProps {
  id: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewPermission?: string;
  editPermission?: string;
  deletePermission?: string;
  detailPath?: string;
}

export function RowActions({
  id,
  onView,
  onEdit,
  onDelete,
  viewPermission,
  editPermission,
  deletePermission,
  detailPath,
}: RowActionsProps) {
  const router = useRouter();
  const { can } = usePermission();
  const [open, setOpen] = useState(false);

  const canView = !viewPermission || can(viewPermission);
  const canEdit = !editPermission || can(editPermission);
  const canDelete = !deletePermission || can(deletePermission);

  const handleView = () => {
    setOpen(false);
    if (onView) {
      onView();
    } else if (detailPath) {
      router.push(detailPath);
    }
  };

  const handleEdit = () => {
    setOpen(false);
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    setOpen(false);
    if (onDelete) {
      onDelete();
    }
  };

  const hasAnyAction = canView || canEdit || canDelete;
  if (!hasAnyAction) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-gray-100">
        <MoreVertical className="h-4 w-4 text-gray-600" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canView && (
          <DropdownMenuItem onClick={handleView} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {canEdit && (
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {(canView || canEdit) && canDelete && <DropdownMenuSeparator />}
        {canDelete && (
          <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
