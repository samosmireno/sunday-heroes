import { Slot, Slottable } from "@radix-ui/react-slot";
import React, { HTMLProps } from "react";

export const MultiStepFormStep = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<
    {
      asChild?: boolean;
    } & HTMLProps<HTMLDivElement>
  >
>(function MultiStepFormStep({ children, asChild, ...props }, ref) {
  const Cmp = asChild ? Slot : "div";
  return (
    <Cmp ref={ref} {...props}>
      <Slottable>{children}</Slottable>
    </Cmp>
  );
});
