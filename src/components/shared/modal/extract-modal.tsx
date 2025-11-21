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
        className="
          w-[90%] max-w-sm
          sm:max-w-md
          md:max-w-lg
          px-4 py-6
          rounded-xl
          [&>button]:hidden
        "
        // Prevent closing
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-lg sm:text-xl">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-4">
          <Loader2
            className="
              h-12 w-12 sm:h-16 sm:w-16 
              animate-spin 
              text-blue-600
            "
          />
          <DialogDescription className="text-center text-sm sm:text-base">
            {message}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}
