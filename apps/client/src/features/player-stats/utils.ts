export const getResultColor = (result: "W" | "D" | "L", hoverable: boolean) => {
  switch (result) {
    case "W":
      return `bg-green-500 text-white ${hoverable && "hover:bg-green-600"}`;
    case "D":
      return `bg-yellow-500 text-white ${hoverable && "hover:bg-yellow-600"}`;
    case "L":
      return `bg-red-500 text-white ${hoverable && "hover:bg-red-600"}`;
  }
};
