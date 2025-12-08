import { useForm } from "react-hook-form";
import { resetPasswordFormValues, resetPasswordSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useResetPassword } from "./use-reset-password";
import { useSearchParams } from "react-router-dom";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { resetPassword, isLoading, isSuccess } = useResetPassword();

  const form = useForm<resetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!token) {
      // Handle missing token
    }
  }, [token]);

  const onSubmit = (values: resetPasswordFormValues) => {
    if (!token) {
      return;
    }
    resetPassword({ token, password: values.password });
  };

  if (!token) {
    return (
      <div className="rounded-lg border-2 border-red-500/60 bg-panel-bg p-6 shadow-lg">
        <h2
          className="mb-4 text-center font-oswald text-2xl font-bold uppercase tracking-wider text-red-400"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Invalid Link
        </h2>
        <p className="mb-6 text-center text-gray-300">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-accent/20 p-3">
            <CheckCircle2 className="h-8 w-8 text-accent" />
          </div>
        </div>
        <h2
          className="mb-4 text-center font-oswald text-2xl font-bold uppercase tracking-wider text-accent"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Password Reset!
        </h2>
        <p className="mb-6 text-center text-gray-300">
          Your password has been reset successfully. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg">
      <h2
        className="mb-2 text-center font-oswald text-2xl font-bold uppercase tracking-wider text-accent"
        style={{ textShadow: "2px 2px 0 #000" }}
      >
        Reset Password
      </h2>
      <p className="mb-6 text-center text-sm text-gray-400">
        Enter your new password below.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      placeholder="••••••••"
                      className="border-accent/40 bg-panel-bg/60 pr-10 text-white focus-visible:ring-accent/50"
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
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      placeholder="••••••••"
                      className="border-accent/40 bg-panel-bg/60 pr-10 text-white focus-visible:ring-accent/50"
                    />
                    <Button
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-0 top-0 h-full px-3 text-gray-300 hover:bg-transparent hover:text-accent"
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full border-2 border-accent bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
