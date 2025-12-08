import { useForm } from "react-hook-form";
import { forgotPasswordFormValues, forgotPasswordSchema } from "./schema";
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
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "./use-forgot-password";

export default function ForgotPasswordForm() {
  const { forgotPassword, isLoading, isSuccess } = useForgotPassword();
  const form = useForm<forgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = (values: forgotPasswordFormValues) => {
    forgotPassword({ email: values.email });
  };

  if (isSuccess) {
    return (
      <div className="rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-accent/20 p-3">
            <Mail className="h-8 w-8 text-accent" />
          </div>
        </div>
        <h2
          className="mb-4 text-center font-oswald text-2xl font-bold uppercase tracking-wider text-accent"
          style={{ textShadow: "2px 2px 0 #000" }}
        >
          Check Your Email
        </h2>
        <p className="mb-6 text-center text-gray-300">
          If an account exists with this email, you will receive password reset
          instructions shortly.
        </p>
        <Link to="/login">
          <Button
            className="w-full border-2 border-accent bg-accent/20 text-accent hover:bg-accent/30"
            type="button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-accent bg-panel-bg p-6 shadow-lg">
      <h2
        className="mb-2 text-center font-oswald text-2xl font-bold uppercase tracking-wider text-accent"
        style={{ textShadow: "2px 2px 0 #000" }}
      >
        Forgot Password
      </h2>
      <p className="mb-6 text-center text-sm text-gray-400">
        Enter your email address and we'll send you instructions to reset your
        password.
      </p>
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
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full border-2 border-accent bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
          <Link to="/login">
            <Button
              className="w-full text-accent/80 hover:bg-transparent hover:text-accent"
              variant="ghost"
              type="button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </form>
      </Form>
    </div>
  );
}
