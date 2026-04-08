import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils/cn";

type PasswordInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "type"
>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <Button
        onClick={() => setShowPassword((v) => !v)}
        className="absolute right-0 top-0 h-full px-3 text-gray-300 hover:bg-transparent hover:text-accent"
        size="icon"
        type="button"
        variant="ghost"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
