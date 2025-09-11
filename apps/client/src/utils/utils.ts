export const capitalizeFirstLetter = (string: string) => {
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export function formatErrorStack(stack?: string): string {
  if (!stack) return "No stack trace available";

  const lines = stack.split("\n");
  const formattedLines = lines
    .filter((line) => line.trim())
    .map((line) => {
      const match = line.match(/^(.+?)@(.+?)$/);
      if (!match) return line;

      const [, functionName, fullPath] = match;

      const cleanFunctionName = functionName.trim() || "anonymous";

      let cleanPath = fullPath;

      cleanPath = cleanPath.replace(/^https?:\/\/localhost:\d+\//, "");

      if (cleanPath.includes("node_modules")) {
        const nodeModulesMatch = cleanPath.match(/node_modules\/([^/]+)/);
        if (nodeModulesMatch) {
          cleanPath = `node_modules/${nodeModulesMatch[1]}`;
        }
      }

      const lineColMatch = cleanPath.match(/:(\d+):(\d+)$/);
      let lineCol = "";
      if (lineColMatch) {
        lineCol = `:${lineColMatch[1]}:${lineColMatch[2]}`;
        cleanPath = cleanPath.replace(/:(\d+):(\d+)$/, "");
      }

      cleanPath = cleanPath.replace(/\?.*$/, "").replace(/#.*$/, "");

      return `  ${cleanFunctionName}\n    at ${cleanPath}${lineCol}`;
    })
    .slice(0, 10);

  return formattedLines.join("\n");
}

export const formatDate = (date: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(date).toLocaleString("en-US", options);
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
