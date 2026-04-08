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
import { Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useRegister } from "./use-register";
import { PasswordInput } from "@/components/ui/password-input";

export default function RegisterForm() {
  const location = useLocation();

  const inviteToken = location.state?.inviteToken as string;
  const invitedBy = location.state?.invitedBy as string;

  const { register, isLoading } = useRegister({ invitedBy });
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (values: RegisterFormValues) => {
    register({
      name: values.name,
      email: values.email,
      password: values.password,
      inviteToken,
    });
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="John"
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
                  <PasswordInput
                    {...field}
                    placeholder="••••••••"
                    className="border-accent/40 bg-panel-bg/60 text-white focus-visible:ring-accent/50"
                  />
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
                  <PasswordInput
                    {...field}
                    placeholder="••••••••"
                    className="border-accent/40 bg-panel-bg/60 text-white focus-visible:ring-accent/50"
                  />
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
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
