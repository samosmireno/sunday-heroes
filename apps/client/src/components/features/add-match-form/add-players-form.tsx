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
        <div
          className={`flex w-full flex-row p-10 ${isEdited ? "justify-end" : "justify-between"}`}
        >
          {!isEdited && (
            <Button type={"button"} variant={"outline"} onClick={prevStep}>
              Previous
            </Button>
          )}
          <Button
            className="border-green-300 bg-gradient-to-br from-green-400 to-green-600 transition-all duration-300 ease-linear hover:from-green-400 hover:to-green-800"
            onClick={isEdited ? undefined : nextStep}
            type={isEdited ? "submit" : "button"}
            disabled={!isStepValid()}
          >
            {isEdited ? "Save Changes" : "Next"}
          </Button>
        </div>
      </Form>
    </FormLayout>
  );
}
