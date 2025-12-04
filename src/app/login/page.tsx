"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [aba, setAba] = useState<"entrar" | "cadastrar">("entrar");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");

  const [loading, setLoading] = useState(false);

  // LOGIN --------------------------------------------------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { user } = await signInWithEmailAndPassword(auth, email, senha);
    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) {
      alert("Usuário sem perfil configurado.");
      setLoading(false);
      return;
    }

    const data = snap.data() as any;

    if (data.role === "owner") {
      router.push("/admin");
      return;
    }

    if (!data.companyId || data.status !== "active") {
      router.push("/aguarde-aprovacao");
      return;
    }

    router.push(`/empresa/${data.companyId}/dashboard`);
  }

  // CADASTRO --------------------------------------------------
  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // cria usuário no Auth
    const { user } = await createUserWithEmailAndPassword(auth, email, senha);

    // cria documento no Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: nome,
      email: email,
      role: "user",
      status: "pending",        // ainda não aprovado
      companyId: null,          // admin define depois
      createdAt: new Date(),
    });

    // redireciona para tela de espera
    router.push("/aguarde-aprovacao");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E3F7E9]">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md px-10 py-10">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
            <span className="text-2xl text-white">🥚</span>
          </div>
        </div>

        <h1 className="text-center text-2xl font-semibold text-gray-800">Easy Farm</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Sistema de Gerenciamento de Granja
        </p>

        {/* ABAS */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex gap-1">
            <button
              type="button"
              onClick={() => setAba("entrar")}
              className={`px-4 py-1 rounded-full text-sm ${
                aba === "entrar" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={() => setAba("cadastrar")}
              className={`px-4 py-1 rounded-full text-sm ${
                aba === "cadastrar" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Cadastrar
            </button>
          </div>
        </div>

        {/* FORMULÁRIO DE LOGIN */}
        {aba === "entrar" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="exemplo@email.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        )}

        {/* FORMULÁRIO DE CADASTRO */}
        {aba === "cadastrar" && (
          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="exemplo@email.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                placeholder="Crie uma senha"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
