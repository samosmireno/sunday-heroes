import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-oklch(0.709 0.01 56.259) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-oklch(0.553 0.013 58.071)",
  {
    variants: {
      variant: {
        default:
          "bg-oklch(0.216 0.006 56.043) text-oklch(0.985 0.001 106.423) shadow hover:bg-oklch(0.216 0.006 56.043)/90 dark:bg-oklch(0.923 0.003 48.717) dark:text-oklch(0.216 0.006 56.043) dark:hover:bg-oklch(0.923 0.003 48.717)/90",
        destructive:
          "bg-oklch(0.577 0.245 27.325) text-destructive-foreground shadow-sm hover:bg-oklch(0.577 0.245 27.325)/90 dark:bg-oklch(0.704 0.191 22.216) dark:hover:bg-oklch(0.704 0.191 22.216)/90",
        outline:
          "border border-oklch(0.923 0.003 48.717) bg-oklch(1 0 0) shadow-sm hover:bg-oklch(0.97 0.001 106.424) hover:text-oklch(0.216 0.006 56.043) dark:border-oklch(1 0 0 / 15%) dark:bg-oklch(0.147 0.004 49.25) dark:hover:bg-oklch(0.268 0.007 34.298) dark:hover:text-oklch(0.985 0.001 106.423)",
        secondary:
          "bg-oklch(0.97 0.001 106.424) text-oklch(0.216 0.006 56.043) shadow-sm hover:bg-oklch(0.97 0.001 106.424)/80 dark:bg-oklch(0.268 0.007 34.298) dark:text-oklch(0.985 0.001 106.423) dark:hover:bg-oklch(0.268 0.007 34.298)/80",
        ghost:
          "hover:bg-oklch(0.97 0.001 106.424) hover:text-oklch(0.216 0.006 56.043) dark:hover:bg-oklch(0.268 0.007 34.298) dark:hover:text-oklch(0.985 0.001 106.423)",
        link: "text-oklch(0.216 0.006 56.043) underline-offset-4 hover:underline dark:text-oklch(0.923 0.003 48.717)",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
