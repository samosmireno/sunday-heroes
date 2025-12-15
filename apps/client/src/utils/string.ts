export const capitalizeFirstLetter = (string: string) => {
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatDate = (date: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(date).toLocaleDateString("en-GB", options);
};

export function convertMatchType(matchType: string): string {
  if (!matchType) {
    return "";
  }
  return matchType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}
