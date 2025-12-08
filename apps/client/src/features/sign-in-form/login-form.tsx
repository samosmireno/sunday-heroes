import { useForm } from "react-hook-form";
import { loginFormValues, loginSchema } from "./schema";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLogin } from "./use-login";
import { Link } from "react-router-dom";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useLogin();
  const form = useForm<loginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (values: loginFormValues) => {
    login({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <div className="rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg">
      <h2
        className="mb-4 text-center font-oswald text-2xl font-bold uppercase tracking-wider text-accent"
        style={{ textShadow: "2px 2px 0 #000" }}
      >
        Login
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="you@example.com"
                    className="border-accent/40 bg-panel-bg/60 text-white focus-visible:ring-accent/50"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">Password</FormLabel>
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
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-accent/80 hover:text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full border-2 border-accent bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
