import { useState } from "react";
import { Button } from "../ui/button";
import { PageErrorBoundary } from "../features/error-boundary/page-error-boundary";

function ComponentThatThrows() {
  throw new Error("Page component error");
  return null; // This will never be reached, but satisfies TypeScript
}

export function PageErrorTest() {
  const [showErrorComponent, setShowErrorComponent] = useState(false);

  return (
    <PageErrorBoundary pageName="Test Page" showBackButton={true}>
      <div className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">Page Error Boundary Test</h2>

        <Button
          onClick={() => setShowErrorComponent(true)}
          variant="destructive"
        >
          Trigger Page Error
        </Button>

        {showErrorComponent && <ComponentThatThrows />}
      </div>
    </PageErrorBoundary>
  );
}
