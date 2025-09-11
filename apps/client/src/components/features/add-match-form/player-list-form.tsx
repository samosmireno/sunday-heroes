import { Button } from "../../ui/button";
import { useMultiStepFormContext } from "../multi-step-form/multi-step-form-context";
import { Form, FormItem, FormMessage } from "../../ui/form";
import { useEffect, useState } from "react";
import { Team } from "@repo/shared-types";
import TeamSection from "./team-section";
import FormLayout from "./form-layout";
import { CompetitionPlayersData } from "./add-match-schemas";

interface PlayersListFormProps {
  isEdited: boolean;
}

export default function PlayersListForm({ isEdited }: PlayersListFormProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [openAutocomplete, setOpenAutocomplete] = useState<Team | null>(null);
  const { form, nextStep, prevStep, isStepValid } = useMultiStepFormContext();

  const formPlayers: CompetitionPlayersData = form.getValues("players");

  useEffect(() => {
    setSelectedPlayers(
      formPlayers?.homePlayers?.concat(formPlayers.awayPlayers) ?? [],
    );
  }, [formPlayers]);

  const handleAutocompleteOpen = (team: Team) => {
    setOpenAutocomplete(team);
  };

  const handleAutocompleteClose = () => {
    setOpenAutocomplete(null);
  };

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
              isEdited={isEdited}
              isAutocompleteOpen={openAutocomplete === Team.HOME}
              onAutocompleteOpen={() => handleAutocompleteOpen(Team.HOME)}
              onAutocompleteClose={handleAutocompleteClose}
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
              isEdited={isEdited}
              isAutocompleteOpen={openAutocomplete === Team.AWAY}
              onAutocompleteOpen={() => handleAutocompleteOpen(Team.AWAY)}
              onAutocompleteClose={handleAutocompleteClose}
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
            onClick={nextStep}
            type={"button"}
            className="transform rounded-lg border-2 border-accent bg-accent/20 px-4 py-2 font-bold text-accent shadow-md transition-all duration-200 hover:translate-y-1 hover:bg-accent/30"
            disabled={!isStepValid()}
          >
            Next
          </Button>
        </div>
      </Form>
    </FormLayout>
  );
}
