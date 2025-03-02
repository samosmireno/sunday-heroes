import useOutsideClick from "../../../hooks/use-outside-click";
import { Button } from "../../ui/button";

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  const ref = useOutsideClick(onCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="rounded-lg bg-white p-6 text-center shadow-lg"
      >
        <p className="mb-4">Are you sure you want to delete this match?</p>
        <div className="flex flex-row justify-center space-x-8">
          <Button variant={"destructive"} onClick={onConfirm}>
            Yes
          </Button>
          <Button onClick={onCancel}>No</Button>
        </div>
      </div>
    </div>
  );
}
