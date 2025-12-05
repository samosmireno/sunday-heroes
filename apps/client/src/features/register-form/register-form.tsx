import { useForm } from "react-hook-form";
import { RegisterFormValues, registerSchema } from "./schema";
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
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (values: RegisterFormValues) => {
    // TODO: Wire up to your auth/registration flow or API
    // For now, just log. Replace with actual registration action.
    // e.g., await register(values).then(...).catch(...)
    console.log("Register submit:", values);
  };

  return (
    <div className="rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg">
      <h2
        className="mb-4 text-center font-oswald text-2xl font-bold uppercase tracking-wider text-accent"
        style={{ textShadow: "2px 2px 0 #000" }}
      >
        Create Account
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="yourusername"
                    className="border-accent/40 bg-panel-bg/60 text-white focus-visible:ring-accent/50"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      {...field}
                      placeholder="••••••••"
                      className="border-accent/40 bg-panel-bg/60 pr-10 text-white focus-visible:ring-accent/50"
                    />
                    <Button
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-0 top-0 h-full px-3 text-gray-300 hover:bg-transparent hover:text-accent"
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {showConfirm ? (
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
            className="w-full border-2 border-accent bg-accent/20 text-accent hover:bg-accent/30"
          >
            Register
          </Button>
        </form>
      </Form>
    </div>
  );
}
