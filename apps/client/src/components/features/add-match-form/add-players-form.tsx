import { Button } from "../../ui/button";
import { useMultiStepFormContext } from "../multi-step-form/multi-step-form-context";
import { Form, FormItem, FormMessage } from "../../ui/form";
import { useEffect, useState } from "react";
import { Team } from "../../../types/types";
import TeamSection from "./team-section";
import FormLayout from "./form-layout";
import { DuelPlayersForm } from "@repo/logger";

interface AddPlayersFormProps {
  isEdited: boolean;
}

export default function AddPlayersForm({ isEdited }: AddPlayersFormProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const { form, nextStep, prevStep, isStepValid } = useMultiStepFormContext();

  const formPlayers: DuelPlayersForm = form.getValues("players");

  useEffect(() => {
    setSelectedPlayers(
      formPlayers?.homePlayers?.concat(formPlayers.awayPlayers) ?? [],
    );
  }, [formPlayers]);

  return (
    <FormLayout title="Add players">
      <Form {...form}>
        <div className="flex h-full w-full flex-col space-y-8 py-10">
          <FormItem>
            <TeamSection
              team={Team.HOME}
              form={form}
              selectedPlayers={selectedPlayers}
              setSelectedPlayers={setSelectedPlayers}
              initialPlayers={formPlayers?.homePlayers ?? []}
            />
            <FormMessage />
          </FormItem>
          <FormItem>
            <TeamSection
              team={Team.AWAY}
              form={form}
              selectedPlayers={selectedPlayers}
              setSelectedPlayers={setSelectedPlayers}
              initialPlayers={formPlayers?.awayPlayers ?? []}
            />
            <FormMessage />
          </FormItem>
        </div>
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="rounded-lg border-2 border-accent/50 bg-transparent px-4 py-2 font-bold text-gray-300 transition-all hover:bg-accent/10"
          >
            Previous
          </Button>
          <Button
            onClick={isEdited ? undefined : nextStep}
            type={isEdited ? "submit" : "button"}
            className="transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30"
            disabled={!isStepValid()}
          >
            {isEdited ? "Save Changes" : "Next"}
          </Button>
        </div>
      </Form>
    </FormLayout>
  );
}
