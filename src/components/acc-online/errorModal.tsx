import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { score: number; incorrectFields: string[] } | null;
}

const ErrorModal = ({ isOpen, onClose, data }: ErrorModalProps) => {
  // change language
  const translate = useTranslations("NIDPage");

  if (!isOpen) return null;

  const getFieldLabel = (field: string) => {
    const fieldLabels: { [key: string]: string } = {
      lastNameEn: translate("lnameEn"),
      firstNameEn: translate("fnameEn"),
      dob: translate("dob"),
      firstNameKh: translate("fnameKH"),
      lastNameKh: translate("lnameKH"),
      gender: translate("gender"),
      expiredDate: translate("exp"),
      issuedDate: translate("issued"),
    };
    return fieldLabels[field] || field;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-red-600">
              {translate("valid_fail")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{translate("not_match")}</p>
          <div className="bg-red-50 text-gray-600 p-3 rounded-lg">
            <p className="text-sm">
              <strong>{translate("score")}:</strong> {(data?.score || 0) * 100}%
            </p>
            <p className="text-sm mb-2">
              <strong>{translate("incorrect")}</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-red-700">
              {data?.incorrectFields.map((field, index) => (
                <li key={index}>{getFieldLabel(field)}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {translate("close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
