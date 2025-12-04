"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function BackButton({ label = "Voltar" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-4"
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}
