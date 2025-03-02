import React from "react";

interface FormLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function FormLayout({ title, children }: FormLayoutProps) {
  return (
    <div className="flex h-full flex-col items-center justify-between rounded-3xl bg-white">
      <div className="h-10 w-full p-10 text-lg font-semibold">{title}</div>
      {children}
    </div>
  );
}
