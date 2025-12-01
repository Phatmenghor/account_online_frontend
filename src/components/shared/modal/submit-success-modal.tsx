import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  description?: string;
}

export default function SubmitSuccessModal({
  isOpen,
  onClose,
  title,
  message,
  description,
}: SuccessModalProps) {
  const translate = useTranslations("NIDPage");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 pt-2">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-green-600">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <DialogDescription className="text-center text-base pb-2">
            {message}
          </DialogDescription>
          {description && (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">
                {translate("account_number") || "Account Number"}
              </p>
              <p className="text-xl font-bold text-gray-900">{description}</p>
            </div>
          )}
          <Button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {translate("close") || "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
