"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import {
  CurrencyDollar,
  ChartBar,
  ChartPie,
  ArrowUp,
  ArrowDown,
  CalendarBlank,
} from "@/components/icons";
import { ArrowUDownLeftIcon } from "@phosphor-icons/react";

type MovimentoBase = {
  id: string;
  tipo: "venda" | "despesa";
  descricao: string;
  valor: number;
  data: Timestamp;
  origem?: string | null;
};

export default function FinanceiroPage() {
  const { companyId } = useParams() as { companyId: string };
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [movimentos, setMovimentos] = useState<MovimentoBase[]>([]);

  // UI – Aba de cadastro
  const [aba, setAba] = useState<"venda" | "despesa">("venda");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [origem, setOrigem] = useState("");

  // Filtros
  const [filtroPeriodo, setFiltroPeriodo] = useState<"30" | "90" | "365" | "all">(
    "30"
  );

  // ==================== AUTH ====================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  // ==================== CARGA — VENDAS + DESPESAS ====================
  async function carregarMovimentos() {
    setCarregando(true);

    // Função para padronizar registro antigo/novo
    const normalizar = (doc: any, tipo: "venda" | "despesa") => {
      const d = doc.data() || {};

      // pegar qualquer campo de data possível
      const raw =
        d.data ||
        d.createdAt ||
        d.dataCriacao ||
        d.timestamp ||
        Timestamp.now();

      return {
        id: doc.id,
        tipo,
        descricao: d.descricao || (tipo === "venda" ? "Venda" : "Despesa"),
        valor: Number(d.valor || 0),
        data: raw instanceof Timestamp ? raw : Timestamp.fromDate(new Date(raw)),
        origem: d.origem || d.categoria || null,
      };
    };

    // ---- tentar orderBy("data") primeiro
    let vendasSnap;
    try {
      vendasSnap = await getDocs(
        query(
          collection(db, `companies/${companyId}/vendas`),
          orderBy("data", "desc")
        )
      );
    } catch {
      // se não existir campo 'data' em alguns docs → fallback
      vendasSnap = await getDocs(
        query(collection(db, `companies/${companyId}/vendas`))
      );
    }

    const vendas = vendasSnap.docs.map((d) => normalizar(d, "venda"));

    // ---- despesas
    let despesasSnap;
    try {
      despesasSnap = await getDocs(
        query(
          collection(db, `companies/${companyId}/despesas`),
          orderBy("data", "desc")
        )
      );
    } catch {
      despesasSnap = await getDocs(
        query(collection(db, `companies/${companyId}/despesas`))
      );
    }

    const despesas = despesasSnap.docs.map((d) => normalizar(d, "despesa"));

    // merge + ordenar manualmente por data
    const tudo = [...vendas, ...despesas].sort(
      (a, b) => b.data.toMillis() - a.data.toMillis()
    );

    setMovimentos(tudo);
    setCarregando(false);
  }

  useEffect(() => {
    carregarMovimentos();
  }, [companyId]);

  // ==================== REGISTRAR ====================
  async function registrar() {
    if (!valor) return alert("Informe um valor");
    if (!descricao) return alert("Informe uma descrição");

    const colecao =
      aba === "venda"
        ? `companies/${companyId}/vendas`
        : `companies/${companyId}/despesas`;

    await addDoc(collection(db, colecao), {
      valor: Number(valor),
      descricao,
      origem: origem || null,
      data: Timestamp.now(),
    });

    setValor("");
    setDescricao("");
    setOrigem("");

    await carregarMovimentos();
  }

  // ==================== HELPERS ====================
  function formatarMoeda(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatarData(ts: Timestamp) {
    return ts.toDate().toLocaleDateString("pt-BR");
  }

  // ==================== FILTRO PERÍODO ====================
  const movimentosFiltrados = useMemo(() => {
    if (filtroPeriodo === "all") return movimentos;

    const dias = Number(filtroPeriodo);
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(hoje.getDate() - dias + 1);

    return movimentos.filter((m) => {
      const d = m.data.toDate();
      return d >= limite && d <= hoje;
    });
  }, [movimentos, filtroPeriodo]);

  // ==================== KPIs ====================
  const {
    totalVendas,
    totalDespesas,
    saldo,
    qtdVendas,
    ticketMedio,
    vendas30,
    despesas30,
  } = useMemo(() => {
    let vendas = 0;
    let despesas = 0;
    let qV = 0;

    movimentos.forEach((m) => {
      if (m.tipo === "venda") {
        vendas += m.valor;
        qV++;
      } else {
        despesas += m.valor;
      }
    });

    const hoje = new Date();
    const limite30 = new Date();
    limite30.setDate(hoje.getDate() - 29);

    let v30 = 0;
    let d30 = 0;

    movimentos.forEach((m) => {
      const d = m.data.toDate();
      if (d >= limite30 && d <= hoje) {
        if (m.tipo === "venda") v30 += m.valor;
        else d30 += m.valor;
      }
    });

    return {
      totalVendas: vendas,
      totalDespesas: despesas,
      saldo: vendas - despesas,
      qtdVendas: qV,
      ticketMedio: qV > 0 ? vendas / qV : 0,
      vendas30: v30,
      despesas30: d30,
    };
  }, [movimentos]);

  const saldoColor =
    saldo > 0
      ? "text-emerald-600"
      : saldo < 0
      ? "text-red-600"
      : "text-muted";

  // ==================== UI ====================
  return (
    <div className="min-h-screen px-6 py-5 space-y-6">


      {/* ==========================================
          HEADER / FILTRO
      ========================================== */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
              <CurrencyDollar
                weight="fill"
                className="text-[var(--color-accent)]"
              />
            </span>
            Financeiro 
          </h1>
          <p className="text-xs text-muted mt-1">
            Visão geral das vendas, despesas e saldo da granja.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <CalendarBlank size={14} className="text-muted" />
          <span className="text-muted hidden sm:inline">Período:</span>

          <div className="inline-flex rounded-full border border-[var(--color-border)] overflow-hidden">
            <button
              type="button"
              className={`px-3 py-1 ${
                filtroPeriodo === "30"
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-muted"
              }`}
              onClick={() => setFiltroPeriodo("30")}
            >
              30d
            </button>

            <button
              type="button"
              className={`px-3 py-1 border-l ${
                filtroPeriodo === "90"
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-muted"
              }`}
              onClick={() => setFiltroPeriodo("90")}
            >
              90d
            </button>

            <button
              type="button"
              className={`px-3 py-1 border-l ${
                filtroPeriodo === "365"
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-muted"
              }`}
              onClick={() => setFiltroPeriodo("365")}
            >
              12m
            </button>

            <button
              type="button"
              className={`px-3 py-1 border-l ${
                filtroPeriodo === "all"
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-muted"
              }`}
              onClick={() => setFiltroPeriodo("all")}
            >
              Tudo
            </button>
          </div>
        </div>
                <button
  onClick={() => router.back()}
  className="btn-primary text-xs flex items-center gap-1"
>
  Voltar <ArrowUDownLeftIcon size={14} />
</button>
      </header>
      
      {/* ==========================================
          REGISTRAR VENDA / DESPESA — VISUAL PREMIUM
      ========================================== */}
      <section className="bg-white dark:bg-zinc-900 border border-[var(--color-border)] shadow-sm rounded-2xl p-5 space-y-5">

        {/* Abas */}
        <div className="flex gap-2">
          <button
            onClick={() => setAba("venda")}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              aba === "venda"
                ? "bg-[var(--color-accent)] text-white shadow"
                : "bg-muted text-muted hover:bg-muted/60"
            }`}
          >
            Registrar Venda
          </button>

          <button
            onClick={() => setAba("despesa")}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              aba === "despesa"
                ? "bg-red-500 text-white shadow"
                : "bg-muted text-muted hover:bg-muted/60"
            }`}
          >
            Registrar Despesa
          </button>
        </div>

        {/* CARD */}
        <div className="border border-[var(--color-border)] rounded-xl p-4 grid gap-4 md:grid-cols-3 bg-zinc-50 dark:bg-zinc-800/50">

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">Valor</label>
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              type="number"
              placeholder="0,00"
              className="input rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">Descrição</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              type="text"
              placeholder={
                aba === "venda"
                  ? "Ex: Venda de ovos"
                  : "Ex: Compra de ração"
              }
              className="input rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">Origem (opcional)</label>
            <input
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              type="text"
              placeholder={
                aba === "venda"
                  ? "Ex: Mercado local"
                  : "Ex: Insumo veterinário"
              }
              className="input rounded-lg"
            />
          </div>

        </div>

        {/* Botão */}
        <button
          onClick={registrar}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all shadow ${
            aba === "venda"
              ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {aba === "venda" ? "Salvar venda" : "Salvar despesa"}
        </button>
      </section>

      {/* ==========================================
          KPIs
      ========================================== */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="card-easy">
          <p className="text-[11px] text-muted flex items-center gap-1">
            <ArrowUp size={12} className="text-emerald-500" />
            Receitas (vendas)
          </p>
          <p className="text-xl font-bold mt-1">{formatarMoeda(totalVendas)}</p>
        </div>

        <div className="card-easy">
          <p className="text-[11px] text-muted flex items-center gap-1">
            <ArrowDown size={12} className="text-red-500" />
            Despesas
          </p>
          <p className="text-xl font-bold mt-1">
            {formatarMoeda(totalDespesas)}
          </p>
        </div>

        <div className="card-easy">
          <p className="text-[11px] text-muted flex items-center gap-1">
            <ChartPie size={12} />
            Saldo acumulado
          </p>
          <p className={`text-xl font-bold mt-1 ${saldoColor}`}>
            {formatarMoeda(saldo)}
          </p>
        </div>

        <div className="card-easy">
          <p className="text-[11px] text-muted flex items-center gap-1">
            <ChartBar size={12} />
            Ticket médio
          </p>
          <p className="text-xl font-bold mt-1">
            {qtdVendas > 0 ? formatarMoeda(ticketMedio) : "—"}
          </p>
        </div>
      </section>

      {/* ==========================================
          RESUMO — 30 DIAS
      ========================================== */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card-easy">
          <p className="text-[11px] text-muted mb-1">Últimos 30 dias</p>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-[11px] text-muted">Vendas</p>
              <p className="font-semibold">{formatarMoeda(vendas30)}</p>
            </div>

            <div>
              <p className="text-[11px] text-muted">Despesas</p>
              <p className="font-semibold">{formatarMoeda(despesas30)}</p>
            </div>

            <div>
              <p className="text-[11px] text-muted">Saldo</p>
              <p
                className={`font-semibold ${
                  vendas30 - despesas30 > 0
                    ? "text-emerald-600"
                    : vendas30 - despesas30 < 0
                    ? "text-red-600"
                    : "text-muted"
                }`}
              >
                {formatarMoeda(vendas30 - despesas30)}
              </p>
            </div>
          </div>
        </div>

        <div className="card-easy md:col-span-2 text-[11px] text-muted">
          <p className="mb-1 font-semibold text-xs">Informação</p>
          <p>
            Este painel exibe a composição financeira consolidada da sua granja
            nos períodos selecionados.
          </p>
        </div>
      </section>

      {/* ==========================================
          TABELA
      ========================================== */}
      <section className="card-easy">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <ChartBar size={16} />
            Movimentações financeiras
          </h2>

          <p className="text-[11px] text-muted">
            {carregando
              ? "Carregando…"
              : movimentosFiltrados.length === 0
              ? "Nenhuma movimentação."
              : `${movimentosFiltrados.length} registro(s)`}
          </p>
        </div>

        {movimentosFiltrados.length > 0 && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-[11px] text-muted border-b border-[var(--color-border)]">
                  <th className="py-2 pr-2">Data</th>
                  <th className="py-2 pr-2">Tipo</th>
                  <th className="py-2 pr-2">Descrição</th>
                  <th className="py-2 pr-2">Origem</th>
                  <th className="py-2 pl-2 text-right">Valor</th>
                </tr>
              </thead>

              <tbody>
                {movimentosFiltrados.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-[var(--color-border)]/60 last:border-0"
                  >
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {formatarData(m.data)}
                    </td>

                    <td className="py-2 pr-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                          m.tipo === "venda"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {m.tipo === "venda" ? (
                          <>
                            <ArrowUp size={10} /> Venda
                          </>
                        ) : (
                          <>
                            <ArrowDown size={10} /> Despesa
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-2 pr-2 max-w-[220px] truncate">
                      {m.descricao}
                    </td>

                    <td className="py-2 pr-2 max-w-[150px] truncate text-muted">
                      {m.origem || "—"}
                    </td>

                    <td className="py-2 pl-2 text-right font-semibold">
                      {m.tipo === "despesa" ? "-" : ""}
                      {formatarMoeda(m.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
