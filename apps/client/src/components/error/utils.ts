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
