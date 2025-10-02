import React, { HTMLProps } from "react";

export const MultiStepFormHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<
    {
      asChild?: boolean;
    } & HTMLProps<HTMLDivElement>
  >
>(function MultiStepFormHeader({ children, asChild, ...props }, ref) {
  // If asChild is true, render children as-is with forwarded ref and props
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      ...props,
      ...(children.props || {}),
    } as React.Attributes);
  }

  // Default rendering as a div
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
