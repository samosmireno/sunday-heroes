import ResetPasswordForm from "@/features/reset-password-form/reset-password-form";
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-secondary p-4">
      <div className="relative max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
