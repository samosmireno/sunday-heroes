import ForgotPasswordForm from "@/features/forgot-password-form/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-secondary p-4">
      <div className="relative max-w-lg">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
