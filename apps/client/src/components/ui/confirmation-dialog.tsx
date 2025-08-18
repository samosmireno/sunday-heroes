import { useState, ReactNode } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { AlertTriangle, Archive, Check, RotateCcw, Trash2 } from "lucide-react";

interface ConfirmationDialogProps {
  title: string;
  description: string | ReactNode;
  triggerContent: ReactNode;
  triggerClassName?: string;
  confirmText: string;
  confirmClassName?: string;
  onConfirm: () => Promise<void>;
  variant?: "destructive" | "warning" | "info";
  icon?: "trash" | "archive" | "reset" | "warning" | "complete";
  loadingText?: string;
}

const iconMap = {
  trash: Trash2,
  archive: Archive,
  reset: RotateCcw,
  warning: AlertTriangle,
  complete: Check,
};

const variantConfig = {
  destructive: {
    borderColor: "border-red-500",
    titleColor: "text-red-500",
    defaultTriggerClass: "bg-red-900/30 text-red-400 hover:bg-red-900/70",
    defaultConfirmClass:
      "transform rounded-lg border-2 border-red-500 bg-red-500/20 px-4 py-2 font-bold text-red-400 shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-red-500/30",
    errorBg: "bg-red-900/30",
    errorBorder: "border-red-500/50",
    errorText: "text-red-300",
  },
  warning: {
    borderColor: "border-orange-500",
    titleColor: "text-orange-500",
    defaultTriggerClass:
      "bg-orange-900/30 text-orange-400 hover:bg-orange-900/70",
    defaultConfirmClass:
      "transform rounded-lg border-2 border-orange-500 bg-orange-500/20 px-4 py-2 font-bold text-orange-400 shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-orange-500/30",
    errorBg: "bg-orange-900/30",
    errorBorder: "border-orange-500/50",
    errorText: "text-orange-300",
  },
  info: {
    borderColor: "border-yellow-500",
    titleColor: "text-yellow-500",
    defaultTriggerClass: "bg-blue-900/30 text-blue-400 hover:bg-blue-900/70",
    defaultConfirmClass:
      "transform rounded-lg border-2 border-yellow-500 bg-yellow-500/20 px-4 py-2 font-bold text-yellow-400 shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-yellow-500/30",
    errorBg: "bg-red-900/30",
    errorBorder: "border-red-500/50",
    errorText: "text-red-300",
  },
};

export default function ConfirmationDialog({
  title,
  description,
  triggerContent,
  triggerClassName,
  confirmText,
  confirmClassName,
  onConfirm,
  variant = "destructive",
  icon = "warning",
  loadingText = "Processing...",
}: ConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const IconComponent = iconMap[icon];
  const config = variantConfig[variant];

  const handleClose = () => {
    if (!isProcessing) {
      setIsOpen(false);
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      await onConfirm();
      handleClose();
    } catch (error: any) {
      console.error("Error in confirmation dialog:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={triggerClassName || config.defaultTriggerClass}
        >
          {triggerContent}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`w-full max-w-md border-2 font-retro ${config.borderColor} bg-panel-bg`}
      >
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-3 text-xl font-bold ${config.titleColor}`}
          >
            {title}
          </DialogTitle>
          {typeof description === "string" ? (
            <DialogDescription className="space-y-4 pt-2">
              <span className="text-gray-200">{description}</span>
            </DialogDescription>
          ) : (
            <DialogDescription asChild>
              <div className="space-y-4 pt-2">{description}</div>
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isProcessing}
            className="rounded-lg border-2 border-accent/50 bg-transparent px-4 py-2 font-bold text-gray-300 transition-all hover:bg-accent/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={confirmClassName || config.defaultConfirmClass}
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {loadingText}
              </>
            ) : (
              <>
                <IconComponent size={16} className="mr-2" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
