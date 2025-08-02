
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';

interface DialogReadyContent {
  id: string;
  title: string;
  tool: string;
  content: string;
  timestamp: number; // as milliseconds
}

interface SavedContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  content: DialogReadyContent | null;
}

export function SavedContentDialog({
  isOpen,
  onOpenChange,
  content,
}: SavedContentDialogProps) {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
            Saved from <Badge variant="secondary">{content.tool}</Badge> on{' '}
            {new Date(content.timestamp).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="prose dark:prose-invert max-w-none p-4 bg-muted rounded-md whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
          {content.content}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
