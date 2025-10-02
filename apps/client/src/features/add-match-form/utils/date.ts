import { format } from "date-fns";

export const formatSafeDate = (date: Date): string => {
  if (!date) return "Pick a date";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Pick a date";
    }

    return format(dateObj, "PPP");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Pick a date";
  }
};
