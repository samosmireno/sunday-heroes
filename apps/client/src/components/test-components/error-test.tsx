import { useState } from "react";
import { Button } from "../ui/button";

export function ErrorTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Test error for Global Error Boundary");
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Error Boundary Test</h2>
      <Button onClick={() => setShouldThrow(true)} variant="destructive">
        Trigger Global Error
      </Button>
    </div>
  );
}
