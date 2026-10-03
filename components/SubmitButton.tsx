"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pending: label = "Please wait…", className = "btn" }: {
  children: React.ReactNode;
  pending?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? label : children}
    </button>
  );
}
