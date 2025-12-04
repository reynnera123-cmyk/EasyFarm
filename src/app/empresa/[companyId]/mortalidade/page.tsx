// src/app/empresa/[companyId]/mortalidade/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  updateDoc,
} from "firebase/firestore";

import {
  Bird,
  Barn,
  ArrowDown,
  ArrowUp,
  CalendarBlank,
} from "@/components/icons";
import { ArrowUDownLeftIcon } from "@phosphor-icons/react";

type Galpao = {
  id: string;
  nome: string;
};

type RegistroMortalidade = {
  id: string;
  data: Timestamp;
  galpaoId: string;
  loteId?: string | null;
  quantidade: number;
  depois: number;
  observacoes?: string | null;
};

export default function MortalidadePage() {
  const { companyId } = useParams() as { companyId: string };
  const router = useRouter();

  const [galpoes, setGalpoes] = useState<Galpao[]>([]);
  const [registros, setRegistros] = useState<RegistroMortalidade[]>([]);

  const [galpaoSelecionado, setGalpaoSelecionado] = useState("");
  const [dataMorte, setDataMorte] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [totalHoje, setTotalHoje] = useState(0);
  const [totalSemana, setTotalSemana] = useState(0);
  const [totalMes, setTotalMes] = useState(0);
  const [totalGeral, setTotalGeral] = useState(0);

  // ===========================
  // Auth
  // ===========================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  // ===========================
  // Carregar dados
  // ===========================
  useEffect(() => {
    async function carregar() {
      setCarregando(true);

      // GALPÕES
      const galpoesSnap = await getDocs(
        collection(db, `companies/${companyId}/galpoes`)
      );
      const listaGalpoes: Galpao[] = galpoesSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          nome: data.nome || d.id,
        };
      });
      setGalpoes(listaGalpoes);

      // MORTALIDADE
      const mortalidadeRef = collection(
        db,
        `companies/${companyId}/mortalidade`
      );
      const mortalidadeQuery = query(
        mortalidadeRef,
        orderBy("data", "desc")
      );
      const mortSnap = await getDocs(mortalidadeQuery);

      const lista: RegistroMortalidade[] = mortSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          data: data.data || data.criadoEm || Timestamp.fromDate(new Date()),
          galpaoId: data.galpaoId,
          loteId: data.loteId || null,
          quantidade: Number(data.quantidade || 0),
          depois: Number(data.depois || 0),
          observacoes: data.observacoes || null,
        };
      });

      setRegistros(lista);
      calcularKPIs(lista);
      setCarregando(false);
    }

    if (companyId) carregar();
  }, [companyId]);

  // ===========================
  // KPIs
  // ===========================
  function calcularKPIs(lista: RegistroMortalidade[]) {
    const hoje = new Date();
    const hojeDia = hoje.getDate();
    const hojeMes = hoje.getMonth();
    const hojeAno = hoje.getFullYear();

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 6);

    const inicioMes = new Date(hojeAno, hojeMes, 1);

    let h = 0;
    let s = 0;
    let m = 0;
    let g = 0;

    lista.forEach((r) => {
      const d = r.data.toDate();
      const qtd = r.quantidade;

      g += qtd;
      if (
        d.getDate() === hojeDia &&
        d.getMonth() === hojeMes &&
        d.getFullYear() === hojeAno
      )
        h += qtd;
      if (d >= inicioSemana && d <= hoje) s += qtd;
      if (d >= inicioMes && d <= hoje) m += qtd;
    });

    setTotalHoje(h);
    setTotalSemana(s);
    setTotalMes(m);
    setTotalGeral(g);
  }

  // ===========================
  // Helpers
  // ===========================
  function formatarData(ts: Timestamp) {
    return ts.toDate().toLocaleDateString("pt-BR");
  }

  function nomeGalpao(id: string) {
    const g = galpoes.find((x) => x.id === id);
    return g ? g.nome : id;
  }

  // ===========================
  // Salvar mortalidade
  // ===========================
  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();

    if (!galpaoSelecionado) {
      alert("Selecione um galpão.");
      return;
    }

    const qtd = Number(quantidade);
    if (!qtd || qtd <= 0) {
      alert("Informe uma quantidade válida de aves mortas.");
      return;
    }

    if (!dataMorte) {
      alert("Informe a data da mortalidade.");
      return;
    }

    setSalvando(true);

    try {
      const [ano, mes, dia] = dataMorte.split("-").map(Number);
      const ts = Timestamp.fromDate(new Date(ano, mes - 1, dia));

      // 1) Procurar lote ATIVO do galpão
      const lotesRef = collection(
        db,
        `companies/${companyId}/galpoes/${galpaoSelecionado}/lotes`
      );
      const lotesQuery = query(lotesRef, where("status", "==", "ativo"));
      const lotesSnap = await getDocs(lotesQuery);

      if (lotesSnap.empty) {
        alert("Esse galpão não possui lote ativo. Não foi possível registrar.");
        setSalvando(false);
        return;
      }

      const loteDoc = lotesSnap.docs[0];
      const loteData = loteDoc.data() as any;

      const atual =
        Number(loteData.quantidadeAtual ?? loteData.quantidadeInicial ?? 0) ||
        0;
      const novaQtd = Math.max(0, atual - qtd);

      // 2) Atualizar lote com nova quantidade
      await updateDoc(loteDoc.ref, {
        quantidadeAtual: novaQtd,
        ultimaMortalidadeEm: ts,
      });

      // 3) Registrar mortalidade em coleção própria
      await addDoc(collection(db, `companies/${companyId}/mortalidade`), {
        companyId,
        data: ts,
        galpaoId: galpaoSelecionado,
        loteId: loteDoc.id,
        quantidade: qtd,
        depois: novaQtd,
        observacoes: observacoes || null,
        criadoEm: serverTimestamp(),
      });

      // 4) Recarregar lista
      const mortalidadeRef = collection(
        db,
        `companies/${companyId}/mortalidade`
      );
      const mortalidadeQuery = query(
        mortalidadeRef,
        orderBy("data", "desc")
      );
      const mortSnap = await getDocs(mortalidadeQuery);

      const lista: RegistroMortalidade[] = mortSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          data: data.data || data.criadoEm || Timestamp.fromDate(new Date()),
          galpaoId: data.galpaoId,
          loteId: data.loteId || null,
          quantidade: Number(data.quantidade || 0),
          depois: Number(data.depois || 0),
          observacoes: data.observacoes || null,
        };
      });

      setRegistros(lista);
      calcularKPIs(lista);

      // limpar form
      setQuantidade("");
      setObservacoes("");
      const hoje = new Date().toISOString().slice(0, 10);
      setDataMorte(hoje);

      alert("Mortalidade registrada e lote atualizado com sucesso.");
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar mortalidade. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  // define data padrão
  useEffect(() => {
    if (!dataMorte) {
      const hoje = new Date().toISOString().slice(0, 10);
      setDataMorte(hoje);
    }
  }, [dataMorte]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
              <Bird weight="fill" className="text-[var(--color-accent)]" />
            </span>
            Mortalidade 
          </h1>
          <p className="text-sm text-muted">
            Registre mortalidade de aves por galpão e mantenha o lote sempre
            atualizado.
          </p>
        </div>
        <button
  onClick={() => router.back()}
  className="btn-primary text-xs flex items-center gap-1"
>
  Voltar <ArrowUDownLeftIcon size={14} />
</button>

      </header>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="card-easy flex flex-col gap-1">
          <span className="text-[11px] text-muted flex items-center gap-1">
            <ArrowDown size={12} className="text-red-500" />
            Hoje
          </span>
          <span className="text-2xl font-bold">
            {carregando ? "…" : totalHoje}
          </span>
          <span className="text-[11px] text-muted">
            Aves mortas na data de hoje.
          </span>
        </div>

        <div className="card-easy flex flex-col gap-1">
          <span className="text-[11px] text-muted">Últimos 7 dias</span>
          <span className="text-2xl font-bold">
            {carregando ? "…" : totalSemana}
          </span>
          <span className="text-[11px] text-muted">
            Soma de mortalidade na última semana.
          </span>
        </div>

        <div className="card-easy flex flex-col gap-1">
          <span className="text-[11px] text-muted">Mês atual</span>
          <span className="text-2xl font-bold">
            {carregando ? "…" : totalMes}
          </span>
          <span className="text-[11px] text-muted">
            Mortalidade acumulada no mês.
          </span>
        </div>

        <div className="card-easy flex flex-col gap-1">
          <span className="text-[11px] text-muted">Total registrado</span>
          <span className="text-2xl font-bold">
            {carregando ? "…" : totalGeral}
          </span>
          <span className="text-[11px] text-muted">
            Todas as aves registradas como mortas.
          </span>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section className="card-easy p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted mb-1">
          <CalendarBlank size={14} />
          <span>Registrar nova mortalidade</span>
        </div>

        <form
          onSubmit={handleSalvar}
          className="grid gap-4 md:grid-cols-4 items-end"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">Galpão</label>
            <select
              className="input-easy text-xs"
              value={galpaoSelecionado}
              onChange={(e) => setGalpaoSelecionado(e.target.value)}
            >
              <option value="">Selecione...</option>
              {galpoes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome} ({g.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">Data</label>
            <input
              type="date"
              className="input-easy text-xs"
              value={dataMorte}
              onChange={(e) => setDataMorte(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-muted">
              Quantidade de aves mortas
            </label>
            <input
              type="number"
              min={0}
              className="input-easy text-xs"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="Ex.: 10"
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-[11px] text-muted">Observações</label>
            <input
              className="input-easy text-xs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Opcional: causa, detalhes..."
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="btn-primary text-xs flex items-center gap-1"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Registrar mortalidade"}
            </button>
          </div>
        </form>
      </section>

      {/* LISTA */}
      <section className="card-easy p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Barn size={16} />
            Registros de mortalidade
          </h2>
          <span className="text-[11px] text-muted">
            {registros.length === 0
              ? "Nenhum registro ainda."
              : `${registros.length} registro(s).`}
          </span>
        </div>

        {registros.length > 0 && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-[11px] text-muted border-b border-[var(--color-border)]">
                  <th className="py-2 pr-2">Data</th>
                  <th className="py-2 pr-2">Galpão</th>
                  <th className="py-2 pr-2">Lote</th>
                  <th className="py-2 pr-2 text-right">Qtd morta</th>
                  <th className="py-2 pr-2 text-right">Qtd após</th>
                  <th className="py-2 pr-2">Obs.</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--color-border)]/60 last:border-0"
                  >
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {formatarData(r.data)}
                    </td>
                    <td className="py-2 pr-2">
                      {nomeGalpao(r.galpaoId)} ({r.galpaoId})
                    </td>
                    <td className="py-2 pr-2 text-[11px]">
                      {r.loteId || "—"}
                    </td>
                    <td className="py-2 pr-2 text-right font-semibold text-red-600">
                      {r.quantidade}
                    </td>
                    <td className="py-2 pr-2 text-right text-[11px]">
                      {r.depois}
                    </td>
                    <td className="py-2 pr-2 max-w-[220px] truncate text-[11px] text-muted">
                      {r.observacoes || "—"}
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
