import { ReactNode } from "react";
import Header from "@/components/ui/header";
import SeasonSelect from "./season-select";
import { SeasonSelection, SeasonSelectionState } from "./use-season-param";

interface SeasonPageShellOptions {
  /** Without a title there is no header yet: the page's name is not in. */
  title?: string;
  /** Under the title: the competition a page belongs to. */
  subtitle?: string;
  hasSidebar: boolean;
  /** Whether the info read, which carries the season list, is still loading. */
  isInfoLoading: boolean;
}

interface SeasonPageShell {
  /** The header, with the season selector in its actions slot; nothing until there is a title. */
  header: ReactNode;
  /** Whether the page is still settling, as `isSeasonSettling` says. */
  settling: boolean;
}

/**
 * The shell every season-aware page shares, built in render from the page's
 * season selection: the header, with the season selector beside the title
 * once the Competition has more than one Season and the selection is known,
 * and whether the page is still settling. The pages render the header above
 * their loader as well as their content, so a season switch keeps it in
 * place; their skeletons and error paths stay their own.
 */
export function seasonPageShell(
  selection: SeasonSelection,
  { title, subtitle, hasSidebar, isInfoLoading }: SeasonPageShellOptions,
): SeasonPageShell {
  const { seasons, selection: value, showSelector, setSelection } = selection;
  const header = title !== undefined && (
    <Header
      title={title}
      subtitle={subtitle}
      hasSidebar={hasSidebar}
      actions={
        showSelector &&
        value !== undefined && (
          <SeasonSelect
            seasons={seasons}
            value={value}
            onChange={setSelection}
          />
        )
      }
    />
  );

  return { header, settling: isSeasonSettling(selection, isInfoLoading) };
}

/**
 * Whether a season-aware page is still settling, so a read with nothing to
 * show is no error yet: the season list is not in (a `?season=` read waits on
 * it), or the list does not know the link's season, which `useSeasonParam`
 * is about to drop from the URL. No season, or one the list knows, settles as
 * soon as the list is in. A failed list read settles too, but settles nothing:
 * a read waiting on the list never goes and so never fails, so the page has
 * to show the list read's own error itself.
 */
export function isSeasonSettling(
  { season, selection }: Pick<SeasonSelectionState, "season" | "selection">,
  isInfoLoading: boolean,
): boolean {
  return isInfoLoading || (season !== undefined && selection !== season);
}
