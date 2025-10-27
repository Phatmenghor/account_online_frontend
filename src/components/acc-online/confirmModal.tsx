"use client"
import { Button } from "@/components/ui/button"

interface ConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message?: string
}

const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirm Information",
  message = "Please confirm that you have reviewed your personal information.",
}: ConfirmationModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-orange-400 flex items-center justify-center">
            <span className="text-orange-400 text-4xl font-bold">!</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">{title}</h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-8 leading-relaxed">{message}</p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors"
          >
            Yes, I have reviewed
          </Button>
          <Button
            onClick={onCancel}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-md transition-colors"
          >
            No, I need to review
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
