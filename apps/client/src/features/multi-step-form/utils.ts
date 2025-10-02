import { z } from "zod";

export function createStepSchema<T extends Record<string, z.ZodType>>(
  steps: T,
) {
  return z.object(steps);
}
