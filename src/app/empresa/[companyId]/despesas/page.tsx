"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function RegistrarDespesaPage() {
  const { companyId } = useParams() as { companyId: string };
  const router = useRouter();

  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");

  async function salvarDespesa(e: React.FormEvent) {
    e.preventDefault();

    await addDoc(collection(db, `companies/${companyId}/despesas`), {
      valor: parseFloat(valor.toString().replace(",", ".")),
      descricao,
      createdAt: serverTimestamp(),
      companyId: companyId,
    });

    alert("Despesa registrada com sucesso!");
    router.push(`/empresa/${companyId}/dashboard`);
  }

  return (
    <div className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registrar Despesa</h1>

      <form onSubmit={salvarDespesa} className="space-y-4">

        <input
          type="number"
          placeholder="Valor da despesa"
          className="border p-2 w-full"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <input
          type="text"
          placeholder="Descrição da despesa"
          className="border p-2 w-full"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <Button className="w-full h-12 text-lg">Salvar</Button>
      </form>
    </div>
  );
}
