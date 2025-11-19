import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export default function LoadingModal({
  isOpen,
  title = "Processing",
  message = "Please wait...",
}: LoadingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden"
        // Prevent closing by clicking outside or pressing escape
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
          <DialogDescription className="text-center text-base">
            {message}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}