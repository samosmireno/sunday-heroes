// PROTOTYPE — throwaway. Registry of the variants the switcher cycles.
import { ComponentType } from "react";
import * as A from "./variant-a";
import * as B from "./variant-b";
import * as C from "./variant-c";
import { VariantPageProps } from "./variant-shared";
import { PrototypeVariant } from "@/components/prototype/prototype-switcher";

export interface VariantPages {
  League: ComponentType<VariantPageProps>;
  Duel: ComponentType<VariantPageProps>;
  Matches: ComponentType<VariantPageProps>;
}

export const VARIANTS: PrototypeVariant[] = [
  { key: "A", name: A.NAME },
  { key: "B", name: B.NAME },
  { key: "C", name: C.NAME },
];

export const VARIANT_PAGES: Record<string, VariantPages> = {
  A: { League: A.League, Duel: A.Duel, Matches: A.Matches },
  B: { League: B.League, Duel: B.Duel, Matches: B.Matches },
  C: { League: C.League, Duel: C.Duel, Matches: C.Matches },
};
