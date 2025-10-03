import { Shield } from "lucide-react";

export function EmptyModeratorsState() {
  return (
    <div className="py-8 text-center">
      <Shield size={48} className="mx-auto mb-4 text-gray-500" />
      <p className="text-gray-400">No moderators added yet</p>
      <p className="text-sm text-gray-500">
        Add moderators to help manage this competition
      </p>
    </div>
  );
}
