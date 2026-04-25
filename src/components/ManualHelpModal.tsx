import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ManualHelpModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
  loading?: boolean;
}

export function ManualHelpModal({ open, onClose, title, content, loading }: ManualHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-96 overflow-auto">
        <DialogHeader>
          <DialogTitle>{title || 'Help'}</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm max-w-none">
          {loading ? <p>Loading...</p> : content ? <div dangerouslySetInnerHTML={{ __html: content }} /> : <p>No help available</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
