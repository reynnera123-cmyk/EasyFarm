"use client";

import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function EmpresaPage() {
  const { companyId } = useParams() as { companyId: string };

  onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "/login";
  });

  return (
    <div>
      <h1>Painel da Empresa: {companyId}</h1>
    </div>
  );
}
