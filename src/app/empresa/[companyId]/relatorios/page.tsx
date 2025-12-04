// src/app/empresa/[companyId]/relatorios/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

import {
  ChartLineUp,
  Egg,
  CurrencyDollar,
  Barn,
  Users,
  ArrowDown,
  CalendarBlank,
} from "@/components/icons";

import { gerarPDFBase } from "@/utils/pdf";
import { ArrowUDownLeftIcon, TrashIcon } from "@phosphor-icons/react";

type Registro = { [key: string]: any };

export default function RelatoriosPage() {
  const { companyId } = useParams() as { companyId: string };
  const router = useRouter();

  const [farmName, setFarmName] = useState("Carregando...");
  const [carregando, setCarregando] = useState(true);

  const [dadosOvos, setDadosOvos] = useState<Registro[]>([]);
  const [dadosFinanceiro, setDadosFinanceiro] = useState<Registro[]>([]);
  const [dadosGalpoes, setDadosGalpoes] = useState<Registro[]>([]);
  const [dadosVacinas, setDadosVacinas] = useState<Registro[]>([]);

  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [erroPeriodo, setErroPeriodo] = useState<string | null>(null);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  // NOME FAZENDA
  useEffect(() => {
    async function loadName() {
      const ref = doc(db, "companies", companyId);
      const snap = await getDoc(ref);
      if (snap.exists()) setFarmName((snap.data() as any).name || "Minha Fazenda");
    }
    if (companyId) loadName();
  }, [companyId]);

  // CARREGAR DADOS
  useEffect(() => {
    async function loadAll() {
      setCarregando(true);

      // ovos
      const ovosSnap = await getDocs(
        collection(db, `companies/${companyId}/ovos`)
      );
      setDadosOvos(ovosSnap.docs.map((d) => d.data() as Registro));

      // vendas + despesas
      const vendasSnap = await getDocs(
        collection(db, `companies/${companyId}/vendas`)
      );
      const despesasSnap = await getDocs(
        collection(db, `companies/${companyId}/despesas`)
      );

      const vendas = vendasSnap.docs.map((d) => ({
        tipo: "venda",
        ...((d.data() as any) || {}),
      }));
      const despesas = despesasSnap.docs.map((d) => ({
        tipo: "despesa",
        ...((d.data() as any) || {}),
      }));

      setDadosFinanceiro([...vendas, ...despesas]);

      // galpões
      const galpoesSnap = await getDocs(
        collection(db, `companies/${companyId}/galpoes`)
      );
      setDadosGalpoes(galpoesSnap.docs.map((d) => d.data() as Registro));

      // vacinas
      const vacSnap = await getDocs(
        collection(db, `companies/${companyId}/vacinas`)
      );
      setDadosVacinas(vacSnap.docs.map((d) => d.data() as Registro));

      setCarregando(false);
    }

    if (companyId) loadAll();
  }, [companyId]);

  // HELPERS

  function extrairDataDoRegistro(
    registro: Registro,
    preferencial?: string
  ): Date | null {
    let raw: any = preferencial ? registro[preferencial] : undefined;

    if (!raw) {
      raw = registro.data || registro.createdAt;
    }

    if (!raw) return null;

    if (raw instanceof Timestamp) return raw.toDate();
    if (raw instanceof Date) return raw;
    if (typeof raw === "string") {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  function formatarDataRegistro(
    registro: Registro,
    preferencial?: string
  ): string {
    const d = extrairDataDoRegistro(registro, preferencial);
    if (!d) return "—";
    return d.toLocaleDateString("pt-BR");
  }

  function filtrarPorPeriodo(
    dados: Registro[],
    preferencial?: string
  ): Registro[] {
    if (!dataInicio && !dataFim) return dados;

    const inicio = dataInicio
      ? new Date(`${dataInicio}T00:00:00`)
      : null;
    const fim = dataFim ? new Date(`${dataFim}T23:59:59`) : null;

    return dados.filter((reg) => {
      const d = extrairDataDoRegistro(reg, preferencial);
      if (!d) return false;
      if (inicio && d < inicio) return false;
      if (fim && d > fim) return false;
      return true;
    });
  }

  function validarPeriodo(): boolean {
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setErroPeriodo("Data inicial não pode ser maior que a data final.");
      return false;
    }
    setErroPeriodo(null);
    return true;
  }

  // GERAR PDF
  async function gerarPDF(tipo: "ovos" | "financeiro" | "galpoes" | "vacinas" | "completo") {
    if (!validarPeriodo()) return;

    if (tipo === "ovos") {
      const filtrados = filtrarPorPeriodo(dadosOvos, "data").map((r) => ({
        ...r,
        _data: formatarDataRegistro(r, "data"),
      }));

      await gerarPDFBase({
        titulo: "Produção de Ovos",
        subTitulo: "Relatório detalhado da produção de ovos",
        fazenda: farmName,
        dados: filtrados,
        colunas: [
          { chave: "_data", label: "Data", largura: 90 },
          { chave: "galpaoId", label: "Galpão", largura: 80 },
          { chave: "quantidade", label: "Qtde", largura: 70 },
          { chave: "observacoes", label: "Observações", largura: 250 },
        ],
      });
      return;
    }

    if (tipo === "financeiro") {
      const filtrados = filtrarPorPeriodo(dadosFinanceiro, "data").map((r) => ({
        ...r,
        _data: formatarDataRegistro(r, "data"),
        _valor:
          typeof r.valor === "number"
            ? r.valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            : r.valor,
        _tipo:
          r.tipo === "venda"
            ? "Venda"
            : r.tipo === "despesa"
            ? "Despesa"
            : r.tipo || "—",
      }));

      await gerarPDFBase({
        titulo: "Financeiro",
        subTitulo: "Vendas, despesas e saldo",
        fazenda: farmName,
        dados: filtrados,
        colunas: [
          { chave: "_data", label: "Data", largura: 90 },
          { chave: "_tipo", label: "Tipo", largura: 70 },
          { chave: "descricao", label: "Descrição", largura: 200 },
          { chave: "origem", label: "Origem", largura: 90 },
          { chave: "_valor", label: "Valor (R$)", largura: 90 },
        ],
      });
      return;
    }

    if (tipo === "galpoes") {
      await gerarPDFBase({
        titulo: "Galpões & Estrutura",
        subTitulo: "Situação atual dos galpões",
        fazenda: farmName,
        dados: dadosGalpoes,
        colunas: [
          { chave: "nome", label: "Galpão", largura: 140 },
          { chave: "status", label: "Status", largura: 80 },
          { chave: "capacidade", label: "Capacidade", largura: 100 },
          { chave: "loteAtualCodigo", label: "Lote Atual", largura: 140 },
        ],
      });
      return;
    }

    if (tipo === "vacinas") {
      const filtrados = filtrarPorPeriodo(dadosVacinas, "data").map((r) => ({
        ...r,
        _data: formatarDataRegistro(r, "data"),
      }));

      await gerarPDFBase({
        titulo: "Aves & Saúde",
        subTitulo: "Vacinas e controle sanitário",
        fazenda: farmName,
        dados: filtrados,
        colunas: [
          { chave: "_data", label: "Data", largura: 90 },
          { chave: "vacina", label: "Vacina", largura: 150 },
          { chave: "galpaoId", label: "Galpão", largura: 80 },
          { chave: "dose", label: "Dose", largura: 80 },
          { chave: "loteCodigo", label: "Lote", largura: 80 },
          { chave: "quantidade", label: "Qtd", largura: 60 },
        ],
      });
      return;
    }

    if (tipo === "completo") {
      const baseOvos = filtrarPorPeriodo(dadosOvos, "data").map((r) => ({
        modulo: "Ovos",
        _data: formatarDataRegistro(r, "data"),
        descricao: `Galpão ${r.galpaoId} - ${r.quantidade} ovos`,
        valor: "",
      }));

      const baseFin = filtrarPorPeriodo(dadosFinanceiro, "data").map((r) => ({
        modulo: r.tipo === "venda" ? "Financeiro (Venda)" : "Financeiro (Despesa)",
        _data: formatarDataRegistro(r, "data"),
        descricao: r.descricao || "",
        valor:
          typeof r.valor === "number"
            ? r.valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            : r.valor || "",
      }));

      const baseVac = filtrarPorPeriodo(dadosVacinas, "data").map((r) => ({
        modulo: "Vacinas",
        _data: formatarDataRegistro(r, "data"),
        descricao: `${r.vacina || ""} - Galpão ${r.galpaoId || ""}`,
        valor: "",
      }));

      const linhas = [...baseOvos, ...baseFin, ...baseVac];

      await gerarPDFBase({
        titulo: "Relatório Geral",
        subTitulo: "Consolidação completa dos dados",
        fazenda: farmName,
        dados: linhas,
        colunas: [
          { chave: "modulo", label: "Módulo", largura: 150 },
          { chave: "_data", label: "Data", largura: 90 },
          { chave: "descricao", label: "Descrição", largura: 250 },
          { chave: "valor", label: "Valor", largura: 80 },
        ],
      });
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen p-6">
        <p className="text-sm text-muted">Carregando relatórios...</p>
      </div>
    );
  }

  const textoPeriodo =
    dataInicio || dataFim
      ? `Período selecionado: ${
          dataInicio
            ? new Date(`${dataInicio}T00:00:00`).toLocaleDateString("pt-BR")
            : "início"
        }  →  ${
          dataFim
            ? new Date(`${dataFim}T00:00:00`).toLocaleDateString("pt-BR")
            : "hoje"
        }`
      : "Período: todos os registros";

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Relatórios / <span className="font-semibold">{farmName}</span>
          </h1>
          <p className="text-sm text-muted">
            Gere PDFs completos da produção, financeiro, saúde e estrutura.
          </p>
        </div>
<button
  onClick={() => router.back()}
  className="btn-primary text-xs flex items-center gap-1"
>
 <ArrowUDownLeftIcon size={14} /> Voltar
</button>
      </header>

      {/* FILTRO DE PERÍODO */}
      <section className="card-easy p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          <CalendarBlank size={14} />
          <span>Filtrar por período</span>
        </div>

        <div className="grid gap-3 md:grid-cols-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">Data inicial</label>
            <input
              type="date"
              className="input-easy text-xs"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">Data final</label>
            <input
              type="date"
              className="input-easy text-xs"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">Atalhos rápidos</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary text-xs flex items-center gap-1"
                onClick={() => {
                  const hoje = new Date();
                  const iso = hoje.toISOString().slice(0, 10);
                  setDataInicio(iso);
                  setDataFim(iso);
                }}
              >
                Hoje
              </button>
              <button
                type="button"
                className="btn-primary text-xs flex items-center gap-1"
                onClick={() => {
                  const hoje = new Date();
                  const d7 = new Date();
                  d7.setDate(hoje.getDate() - 6);
                  setDataInicio(d7.toISOString().slice(0, 10));
                  setDataFim(hoje.toISOString().slice(0, 10));
                }}
              >
                Últimos 7 dias
              </button>
              <button
                type="button"
                className="btn-primary text-xs flex items-center gap-1"
                onClick={() => {
                  const hoje = new Date();
                  const d30 = new Date();
                  d30.setDate(hoje.getDate() - 29);
                  setDataInicio(d30.toISOString().slice(0, 10));
                  setDataFim(hoje.toISOString().slice(0, 10));
                }}
              >
                Últimos 30 dias
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">Ações</label>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-primary text-xs flex items-center gap-1"
                onClick={() => {
                  setDataInicio("");
                  setDataFim("");
                  setErroPeriodo(null);
                }}
              >
               <TrashIcon size={14}/> Limpar período
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted">{textoPeriodo}</span>
          {erroPeriodo && (
            <span className="text-[11px] text-red-500">{erroPeriodo}</span>
          )}
        </div>
      </section>

      {/* GRID DE BOTÕES DE RELATÓRIO */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ovos */}
        <div className="card-easy p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center">
              <Egg size={22} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Produção de Ovos</h2>
              <p className="text-xs text-muted">
                Exportar registros da produção.
              </p>
            </div>
          </div>

          <button
            onClick={() => gerarPDF("ovos")}
            className="btn-primary flex items-center gap-2 text-sm mt-2"
          >
            <ArrowDown size={14} /> Gerar PDF
          </button>
        </div>

        {/* Financeiro */}
        <div className="card-easy p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CurrencyDollar size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Financeiro</h2>
              <p className="text-xs text-muted">Vendas, despesas e saldo.</p>
            </div>
          </div>

          <button
            onClick={() => gerarPDF("financeiro")}
            className="btn-primary flex items-center gap-2 text-sm mt-2"
          >
            <ArrowDown size={14} /> Gerar PDF
          </button>
        </div>

        {/* Galpões */}
        <div className="card-easy p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Barn size={22} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Galpões & Estrutura</h2>
              <p className="text-xs text-muted">Capacidade e situação.</p>
            </div>
          </div>

          <button
            onClick={() => gerarPDF("galpoes")}
            className="btn-primary flex items-center gap-2 text-sm mt-2"
          >
            <ArrowDown size={14} /> Gerar PDF
          </button>
        </div>

        {/* Vacinas */}
        <div className="card-easy p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Users size={22} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Aves & Saúde</h2>
              <p className="text-xs text-muted">
                Vacinas e monitoramento sanitário.
              </p>
            </div>
          </div>

          <button
            onClick={() => gerarPDF("vacinas")}
            className="btn-primary flex items-center gap-2 text-sm mt-2"
          >
            <ArrowDown size={14} /> Gerar PDF
          </button>
        </div>

        {/* Relatório Geral */}
        <div className="card-easy p-5 flex flex-col gap-3 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ChartLineUp size={22} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Relatório Geral</h2>
              <p className="text-xs text-muted">
                Consolidação de ovos, financeiro e vacinas.
              </p>
            </div>
          </div>

          <button
            onClick={() => gerarPDF("completo")}
            className="btn-primary flex items-center gap-2 text-sm mt-2"
          >
            <ArrowDown size={14} /> Gerar PDF Completo
          </button>
        </div>
      </div>
    </div>
  );
}
