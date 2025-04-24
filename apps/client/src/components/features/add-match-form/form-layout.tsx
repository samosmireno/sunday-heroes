import { ReactNode } from "react";

interface FormLayoutProps {
  title: string;
  children: ReactNode;
}

export default function FormLayout({ title, children }: FormLayoutProps) {
  return (
    <div className="rounded-lg bg-panel-bg p-4 sm:p-5">
      <h3
        className="mb-4 border-b border-accent/30 pb-3 text-lg font-bold text-accent sm:mb-5"
        style={{ textShadow: "1px 1px 0 #000" }}
      >
        {title}
      </h3>
      <div className="px-1 py-2 sm:px-2">{children}</div>
    </div>
  );
}
