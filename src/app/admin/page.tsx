"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";

// ÍCONES EXISTENTES
import {
  House,
  CheckCircle,
  Users,
  WarningCircle,
  ArrowRight,
  SignOut as IconSignOut,
} from "@/components/icons";
import { GearFineIcon, TrashIcon } from "@phosphor-icons/react";

export default function AdminPage() {
  const router = useRouter();

  const [empresas, setEmpresas] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [fazendaInput, setFazendaInput] = useState("");
  const [nameInput, setNameInput] = useState(""); // 🔥 ADICIONADO
  const [carregando, setCarregando] = useState(true);

  // ================================
  // AUTENTICAÇÃO + ROLE
  // ================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");

      const usersSnap = await getDocs(collection(db, "users"));
      let roleEncontrada: string | null = null;

      usersSnap.forEach((d) => {
        if (d.data().email === user.email) {
          roleEncontrada = d.data().role;
        }
      });

      if (roleEncontrada !== "admin" && roleEncontrada !== "owner") {
        return router.push("/login");
      }

      carregarEmpresas();
      carregarUsuarios();
    });

    return () => unsub();
  }, []);

  // ================================
  // CARREGAR EMPRESAS
  // ================================
  async function carregarEmpresas() {
    const snap = await getDocs(collection(db, "companies"));
    const lista: any[] = [];

    snap.forEach((docSnap) => {
      lista.push({ id: docSnap.id, ...docSnap.data() });
    });

    setEmpresas(lista);
    setCarregando(false);
  }

  // ================================
  // CARREGAR USUÁRIOS
  // ================================
  async function carregarUsuarios() {
    const snap = await getDocs(collection(db, "users"));
    const lista: any[] = [];

    snap.forEach((d) => lista.push({ id: d.id, ...d.data() }));

    setUsuarios(lista);
  }

  // ================================
  // GERAR PRÓXIMO FAR-XX
  // ================================
  function gerarCodigoAutomatico(lista: any[]) {
    const existentes = lista
      .map((e) => e.id)
      .filter((id) => /^FAR-\d+$/.test(id))
      .map((id) => Number(id.replace("FAR-", "")));

    const proximo = existentes.length > 0 ? Math.max(...existentes) + 1 : 1;

    return `FAR-${String(proximo).padStart(2, "0")}`;
  }

  // ================================
  // CRIAR FAZENDA NOVA
  // ================================
  async function criarFazenda() {
    if (!nameInput) return alert("Digite o nome da fazenda.");

    const codigo = gerarCodigoAutomatico(empresas);

    await setDoc(doc(db, "companies", codigo), {
      name: nameInput,
      createdAt: new Date(),
    });

    alert(`Fazenda criada! Código: ${codigo}`);

    setNameInput("");
    carregarEmpresas();
  }

  // ================================
  // REMOVER EMPRESA + DESVINCULAR USERS
  // ================================
  async function removerEmpresa(id: string) {
    if (!confirm("Tem certeza que deseja apagar esta fazenda COMPLETAMENTE?"))
      return;

    await deleteDoc(doc(db, "companies", id));

    const relacionados = usuarios.filter((u) => u.companyId === id);

    for (const u of relacionados) {
      await updateDoc(doc(db, "users", u.id), { companyId: null });
    }

    alert("Empresa removida com sucesso.");
    carregarEmpresas();
    carregarUsuarios();
  }

  // ================================
  // REMOVER VÍNCULO
  // ================================
  async function removerVinculo(userId: string) {
    await updateDoc(doc(db, "users", userId), { companyId: null });
    alert("Usuário desvinculado.");
    carregarUsuarios();
  }

  // ================================
  // VINCULAR USUÁRIO
  // ================================
  async function vincularUsuario() {
    if (!emailInput || !fazendaInput)
      return alert("Informe e-mail e fazenda.");

    const user = usuarios.find((u) => u.email === emailInput);

    if (!user) return alert("Usuário não encontrado.");
    if (user.companyId) return alert("Usuário já está vinculado a uma fazenda.");

    await updateDoc(doc(db, "users", user.id), {
      companyId: fazendaInput,
    });

    alert("Usuário vinculado com sucesso.");
    setEmailInput("");
    setFazendaInput("");
    carregarUsuarios();
  }

  // ================================
  // TROCAR ROLE
  // ================================
  async function trocarRole(userId: string, novoRole: string) {
    await updateDoc(doc(db, "users", userId), { role: novoRole });
    carregarUsuarios();
  }

  function Card({ children }: { children: any }) {
    return (
      <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm hover:shadow-md transition-all space-y-3">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">

      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <House size={28} className="text-[var(--color-accent)]" />
          <div>
            <h1 className="text-xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted">
              Gerencie empresas e usuários do sistema.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/configuracoes"
            className="px-4 py-2 flex items-center gap-2 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-semibold hover:opacity-90"
          >
            <GearFineIcon size={16} />
            Configurações
          </Link>

          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 flex items-center gap-2 rounded-lg bg-rose-600/10 text-rose-600 text-xs font-semibold hover:bg-rose-600/20"
          >
            <IconSignOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* ================= GERENCIAR USUÁRIOS ================= */}
      <Card>
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Users size={18} className="text-[var(--color-accent)]" />
          Gerenciar Usuários
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <input
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="input-easy"
            placeholder="E-mail do usuário"
          />

          <select
            value={fazendaInput}
            onChange={(e) => setFazendaInput(e.target.value)}
            className="input-easy"
          >
            <option value="">Selecione a fazenda</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          <button onClick={vincularUsuario} className="btn-primary text-xs">
            Vincular usuário
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {usuarios.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-soft)]"
            >
              <div>
                <p className="text-sm font-semibold">{u.email}</p>
                <p className="text-[11px] text-muted">
                  role: {u.role} — fazenda: {u.companyId || "Nenhuma"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => trocarRole(u.id, e.target.value)}
                  defaultValue={u.role}
                  className="text-xs border rounded-lg px-2 py-1"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                  <option value="owner">owner</option>
                </select>

                {u.companyId && (
                  <button
                    onClick={() => removerVinculo(u.id)}
                    className="p-2 bg-rose-600/10 text-rose-600 rounded-lg hover:bg-rose-600/20"
                  >
                    <TrashIcon size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ================= EMPRESAS ================= */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {carregando ? (
          <p className="text-sm text-muted">Carregando empresas...</p>
        ) : (
          empresas.map((empresa) => (
            <Card key={empresa.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{empresa.name}</h2>
                  <p className="text-[11px] text-muted">{empresa.id}</p>
                </div>

                <button
                  onClick={() => removerEmpresa(empresa.id)}
                  className="p-2 bg-rose-600/10 text-rose-600 rounded-lg hover:bg-rose-600/20"
                >
                  <TrashIcon size={18} />
                </button>
              </div>

              <Link
                href={`/empresa/${empresa.id}/dashboard`}
                className="mt-3 w-full px-3 py-2 flex items-center justify-between text-xs font-semibold rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:opacity-90"
              >
                Abrir empresa
                <ArrowRight size={14} />
              </Link>
            </Card>
          ))
        )}

        {/* ================= CRIAR NOVA FAZENDA ================= */}
        <Card>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle size={18} className="text-[var(--color-accent)]" />
            Criar nova fazenda
          </h2>

          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="input-easy"
            placeholder="Nome da fazenda"
          />

          <button
            onClick={criarFazenda}
            className="btn-primary mt-2 text-xs w-full flex items-center justify-center gap-1"
          >
            Criar Fazenda <ArrowRight size={12} />
          </button>
        </Card>
      </section>
    </div>
  );
}
