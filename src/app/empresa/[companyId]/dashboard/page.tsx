"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, Timestamp, doc, getDoc } from "firebase/firestore";

import {
  Egg,
  Barn,
  CurrencyDollar,
  ChartLineUp,
  Users,
  SignOut,
} from "@/components/icons";
import { GearFineIcon } from "@phosphor-icons/react";

type KPI = {
  ovosHoje: number;
  producaoSemanal: number;
  galpoesAtivos: number;
  lucroEstimado: number;
  vendasTotais: number;
  despesasTotais: number;
};

export default function DashboardEmpresaPage() {
  const { companyId } = useParams() as { companyId: string };
  const router = useRouter();

  const [farmName, setFarmName] = useState("Carregando...");
  const [carregando, setCarregando] = useState(true);

  const [kpi, setKpi] = useState<KPI>({
    ovosHoje: 0,
    producaoSemanal: 0,
    galpoesAtivos: 0,
    lucroEstimado: 0,
    vendasTotais: 0,
    despesasTotais: 0,
  });

  // ---------------- AUTENTICAÇÃO ----------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  // ---------------- NOME DA FAZENDA ----------------
  useEffect(() => {
    async function loadName() {
      const ref = doc(db, "companies", companyId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setFarmName(data.name || "Minha Fazenda");
      }
    }
    loadName();
  }, [companyId]);

  // ---------------- CARREGAR KPI ----------------
  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);

      let ovosHoje = 0;
      let producaoSemanal = 0;
      let galpoesAtivos = 0;
      let totalVendas = 0;
      let totalDespesas = 0;

      try {
        const ovosSnap = await getDocs(
          collection(db, `companies/${companyId}/ovos`)
        );

        const hoje = new Date();
        const hojeDia = hoje.getDate();
        const hojeMes = hoje.getMonth();
        const hojeAno = hoje.getFullYear();

        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(hoje.getDate() - 6);

        ovosSnap.forEach((doc) => {
          const raw = (doc.data().data as Timestamp | any) || null;
          if (!raw) return;

          const d = raw instanceof Timestamp ? raw.toDate() : new Date(raw);

          const qtd = Number(doc.data().quantidade || 0);

          if (
            d.getDate() === hojeDia &&
            d.getMonth() === hojeMes &&
            d.getFullYear() === hojeAno
          ) {
            ovosHoje += qtd;
          }

          if (d >= seteDiasAtras && d <= hoje) {
            producaoSemanal += qtd;
          }
        });
      } catch {}

      try {
        const galpoesSnap = await getDocs(
          collection(db, `companies/${companyId}/galpoes`)
        );

        galpoesAtivos = galpoesSnap.docs.filter(
          (d) => (d.data() as any).status === "ativo"
        ).length;
      } catch {}

      try {
        const vendasSnap = await getDocs(
          collection(db, `companies/${companyId}/vendas`)
        );
        vendasSnap.forEach((d) => {
          totalVendas += Number((d.data() as any).valor || 0);
        });

        const despesasSnap = await getDocs(
          collection(db, `companies/${companyId}/despesas`)
        );
        despesasSnap.forEach((d) => {
          totalDespesas += Number((d.data() as any).valor || 0);
        });
      } catch {}

      setKpi({
        ovosHoje,
        producaoSemanal,
        galpoesAtivos,
        lucroEstimado: totalVendas - totalDespesas,
        vendasTotais: totalVendas,
        despesasTotais: totalDespesas,
      });

      setCarregando(false);
    }

    if (companyId) carregarDados();
  }, [companyId]);

  if (carregando) {
    return (
      <div className="min-h-screen p-6">
        <p className="text-sm text-muted">Carregando dados...</p>
      </div>
    );
  }

  const lucroPositivo = kpi.lucroEstimado >= 0;

  return (
    <div className="min-h-screen p-6 space-y-6">

      {/* HEADER */}
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">
            EasyFarm / <span className="font-semibold">{farmName}</span>
          </h1>
          <p className="text-sm text-muted">
            Visão geral da granja: produção, finanças e estrutura operacional.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/configuracoes`}
            className="btn-primary flex items-center gap-2 text-sm mt-2"
          >
            <GearFineIcon size={21}/>Configurações
          </Link>

          <button
            onClick={async () => {
              await auth.signOut();
              router.push("/login");
            }}
            className="p-2 rounded-full hover:bg-[var(--color-accent-soft)] transition"
            title="Sair"
          >
          <SignOut size={20} className="text-muted hover:text-foreground" />
            </button>
          </div>
        </header>
{/* NAV (ÚNICO E PROFISSIONAL) */}
<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">

  {/* Produção de ovos */}
  <Link
    href={`/empresa/${companyId}/ovos`}
    className="card-easy p-4 hover:shadow-md transition-all flex items-start gap-3"
  >
    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-soft)]">
      <Egg size={20} weight="fill" className="text-[var(--color-accent)]" />
    </div>

    <div className="flex flex-col">
      <span className="font-semibold text-sm text-[var(--color-accent)]">
        Produção de ovos
      </span>
      <p className="text-xs text-muted">
        Registros diários e controle produtivo.
      </p>
    </div>
  </Link>

  {/* Aves & Saúde */}
  <Link
    href={`/empresa/${companyId}/vacinas`}
    className="card-easy p-4 hover:shadow-md transition-all flex items-start gap-3"
  >
    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
      <Users size={20} weight="fill" className="text-emerald-600 dark:text-emerald-300" />
    </div>

    <div className="flex flex-col">
      <span className="font-semibold text-sm text-emerald-600">
        Aves & Saúde
      </span>
      <p className="text-xs text-muted">
        Vacinas e monitoramento sanitário.
      </p>
    </div>
  </Link>

  {/* Financeiro */}
  <Link
    href={`/empresa/${companyId}/financeiro`}
    className="card-easy p-4 hover:shadow-md transition-all flex items-start gap-3"
  >
    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
      <CurrencyDollar size={20} weight="fill" className="text-blue-600 dark:text-blue-300" />
    </div>

    <div className="flex flex-col">
      <span className="font-semibold text-sm text-blue-600">
        Financeiro
      </span>
      <p className="text-xs text-muted">
        Vendas, despesas e saldos.
      </p>
    </div>
  </Link>

  {/* Gestão de Recursos */}
  <Link
    href={`/empresa/${companyId}/galpoes`}
    className="card-easy p-4 hover:shadow-md transition-all flex items-start gap-3"
  >
    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40">
      <Barn size={20} weight="fill" className="text-purple-600 dark:text-purple-300" />
    </div>

    <div className="flex flex-col">
      <span className="font-semibold text-sm text-purple-600">
        Gestão de Recursos
      </span>
      <p className="text-xs text-muted">
        Estrutura, galpões e lotes.
      </p>
    </div>
  </Link>

  {/* Relatórios */}
  <Link
    href={`/empresa/${companyId}/relatorios`}
    className="card-easy p-4 hover:shadow-md transition-all flex items-start gap-3"
  >
    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
      <ChartLineUp size={20} weight="fill" className="text-indigo-600 dark:text-indigo-300" />
    </div>

    <div className="flex flex-col">
      <span className="font-semibold text-sm text-indigo-600">
        Relatórios
      </span>
      <p className="text-xs text-muted">
        Análises e gráficos completos.
      </p>
    </div>
  </Link>

</div>


      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card-easy flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Ovos coletados hoje</p>
            <p className="text-2xl font-bold">{kpi.ovosHoje}</p>
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
            <Egg size={22} className="text-[var(--color-accent)]" />
          </div>
        </div>

        <div className="card-easy flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Produção semanal</p>
            <p className="text-2xl font-bold">{kpi.producaoSemanal}</p>
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
            <ChartLineUp size={22} className="text-[var(--color-accent)]" />
          </div>
        </div>

        <div className="card-easy flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Galpões ativos</p>
            <p className="text-2xl font-bold">{kpi.galpoesAtivos}</p>
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
            <Users size={22} className="text-[var(--color-accent)]" />
          </div>
        </div>

        <div className="card-easy flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Lucro estimado</p>
            <p className="text-2xl font-bold">
              {kpi.lucroEstimado.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>

          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
            <CurrencyDollar size={22} className="text-[var(--color-accent)]" />
          </div>
        </div>
      </section>

    </div>
  );
}
