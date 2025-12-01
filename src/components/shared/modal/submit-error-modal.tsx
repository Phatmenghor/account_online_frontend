import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface SubmitErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  description?: string;
}

export default function SubmitErrorModal({
  isOpen,
  onClose,
  title,
  message,
  description,
}: SubmitErrorModalProps) {
  const translate = useTranslations("NIDPage");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 pt-2">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-red-600">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <DialogDescription className="text-center text-base pb-2">
            {message}
          </DialogDescription>
          {/* {description && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    {translate("error_details") || "Error Details"}
                  </p>
                  <p className="text-sm text-red-700">{description}</p>
                </div>
              </div>
            </div>
          )} */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              {translate("close") || "Close"}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {translate("try_again") || "Try Again"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
