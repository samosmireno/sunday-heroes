import { Info, Save } from "lucide-react";
import { Button } from "../../components/ui/button";
import { InfoBox } from "../../components/ui/info-box";

interface FormActionsProps {
  isFormValid: boolean;
  onCancel: () => void;
}

export function FormActions({ isFormValid, onCancel }: FormActionsProps) {
  return (
    <div className="space-y-6 border-t border-accent/30 pt-4">
      <InfoBox title="Important note" icon={Info} className="w-11/12">
        <p>
          Once a competition is created, the type and certain settings cannot be
          changed. Please review your settings carefully.
        </p>
      </InfoBox>

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row sm:space-x-4">
        <Button
          type="button"
          className="w-full rounded-lg border-2 border-accent/50 bg-transparent px-4 py-2 text-accent hover:bg-accent/10 sm:w-auto"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid}
          className="w-full transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 text-accent shadow-md transition-all hover:bg-accent/30 sm:w-auto"
        >
          <Save size={18} className="mr-2" />
          Create Competition
        </Button>
      </div>
    </div>
  );
}
