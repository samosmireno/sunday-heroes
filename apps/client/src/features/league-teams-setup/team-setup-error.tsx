import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function TeamSetupError() {
  const navigate = useNavigate();

  return (
    <div className="p-6 text-center">
      <p>League not found or invalid data.</p>
      <Button onClick={() => navigate("/competitions")} className="mt-4">
        Back to Competitions
      </Button>
    </div>
  );
}
