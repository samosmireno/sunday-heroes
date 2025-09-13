export const sizeClasses = {
  small: "h-5 w-5 lg:h-6 lg:w-6",
  medium: "h-5 w-5 lg:h-6 lg:w-6",
  large: "h-6 w-6 lg:h-7 lg:w-7",
};

export const playerIconNumberSize = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
};

export type playerIconSizeType = keyof typeof sizeClasses;
