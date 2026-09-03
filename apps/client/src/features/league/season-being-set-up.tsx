import { useCompetitionContext } from "@/context/competition-context";

/**
 * The Fixtures tab while the Current season has no Fixtures: between Start
 * new season and the admin's Teams setup save.
 */
export default function SeasonBeingSetUp() {
  const { current } = useCompetitionContext();

  return (
    <div className="py-8 text-center text-gray-400">
      <p className="text-lg font-medium text-gray-300">
        {current !== undefined
          ? `Season ${current} is being set up`
          : "This season is being set up"}
      </p>
      <p className="mt-1 text-sm">
        Fixtures will appear once the teams have been set up.
      </p>
    </div>
  );
}
