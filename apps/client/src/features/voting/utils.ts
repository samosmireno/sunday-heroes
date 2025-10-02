import { config } from "@/config/config";

export function findFirstRankMissing(arr: number[]) {
  for (const val of config.voting.allowedValues) {
    if (!arr.includes(val)) {
      return val;
    }
  }
  return -1;
}
