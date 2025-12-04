"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

import {
  Barbell,
  Barn,
  Bird,
  ArrowRight,
  CalendarBlank,
  Notebook,
  Tag,
  ChartLineUp,
} from "@/components/icons";
import { ArrowUDownLeftIcon } from "@phosphor-icons/react";

type RacaoRegistro = {
  id: string;
  data: Timestamp;
  quantidadeKg: number;
  galpaoId?: string | null;
  loteCodigo?: string | null;
  tipo?: string | null;
  observacoes?: string | null;
};

type Galpao = {
  id: string;
  nome: string;
  loteAtualCodigo?: string | null;
};

export default function RacaoPage() {
  const { companyId } = useParams() as { companyId: string };
  const router = useRouter();

  // Loading
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Dados
  const [registros, setRegistros] = useState<RacaoRegistro[]>([]);
  const [galpoes, setGalpoes] = useState<Galpao[]>([]);

  // Campos do formulário
  const [dataRacao, setDataRacao] = useState(() => {
    const hoje = new Date();
    const y = hoje.getFullYear();
    const m = String(hoje.getMonth() + 1).padStart(2, "0");
    const d = String(hoje.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [quantidadeKg, setQuantidadeKg] = useState("");
  const [galpaoSelecionado, setGalpaoSelecionado] = useState("");
  const [tipo, setTipo] = useState("Inicial");
  const [observacoes, setObservacoes] = useState("");

  // KPIs
  const [totalHoje, setTotalHoje] = useState(0);
  const [totalSemana, setTotalSemana] = useState(0);
  const [totalMes, setTotalMes] = useState(0);
  const [totalGeral, setTotalGeral] = useState(0);

  // ================================
  // Autenticação
  // ================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });

    return () => unsub();
  }, [router]);

  // ================================
  // Carregar galpões + registros
  // ================================
  useEffect(() => {
    async function carregar() {
      setCarregando(true);

      // Galpões
      const galpoesSnap = await getDocs(
        collection(db, `companies/${companyId}/galpoes`)
      );

      const listaGalpoes: Galpao[] = galpoesSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          nome: data.nome || d.id,
          loteAtualCodigo: data.loteAtualCodigo || null,
        };
      });

      setGalpoes(listaGalpoes);

      // Ração
      const ref = collection(db, `companies/${companyId}/racao`);
      const q = query(ref, orderBy("data", "desc"));
      const snap = await getDocs(q);

      const lista = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          data: data.data,
          quantidadeKg: data.quantidadeKg,
          galpaoId: data.galpaoId,
          loteCodigo: data.loteCodigo,
          tipo: data.tipo,
          observacoes: data.observacoes,
        };
      });

      setRegistros(lista);
      calcularKPIs(lista);
      setCarregando(false);
    }

    carregar();
  }, [companyId]);

  // ================================
  // Calcular KPIs
  // ================================
  function calcularKPIs(lista: RacaoRegistro[]) {
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
      const qtd = r.quantidadeKg;

      g += qtd;
      if (d.getDate() === hojeDia && d.getMonth() === hojeMes && d.getFullYear() === hojeAno) h += qtd;
      if (d >= inicioSemana && d <= hoje) s += qtd;
      if (d >= inicioMes && d <= hoje) m += qtd;
    });

    setTotalHoje(h);
    setTotalSemana(s);
    setTotalMes(m);
    setTotalGeral(g);
  }

  // ================================
  // Registrar ração
  // ================================
  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();

    if (!quantidadeKg) {
      alert("Informe a quantidade de ração.");
      return;
    }

    setSalvando(true);

    const [ano, mes, dia] = dataRacao.split("-").map(Number);
    const ts = Timestamp.fromDate(new Date(ano, mes - 1, dia));

    let loteCodigo = null;
    if (galpaoSelecionado) {
      const g = galpoes.find((x) => x.id === galpaoSelecionado);
      loteCodigo = g?.loteAtualCodigo || null;
    }

    await addDoc(collection(db, `companies/${companyId}/racao`), {
      companyId,
      data: ts,
      quantidadeKg: Number(quantidadeKg),
      galpaoId: galpaoSelecionado || null,
      loteCodigo,
      tipo,
      observacoes: observacoes || null,
      criadoEm: serverTimestamp(),
    });

    // Recarrega
    const snap = await getDocs(
      query(
        collection(db, `companies/${companyId}/racao`),
        orderBy("data", "desc")
      )
    );

    const lista = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        data: data.data,
        quantidadeKg: data.quantidadeKg,
        galpaoId: data.galpaoId,
        loteCodigo: data.loteCodigo,
        tipo: data.tipo,
        observacoes: data.observacoes,
      };
    });

    setRegistros(lista);
    calcularKPIs(lista);

    setQuantidadeKg("");
    setObservacoes("");
    setSalvando(false);
  }

  function formatar(ts: Timestamp) {
    return ts.toDate().toLocaleDateString();
  }

  // ================================
  // UI
  // ================================
  return (
    <div className="min-h-screen px-6 py-5 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
            <Barbell weight="fill" className="text-[var(--color-accent)]" />
          </span>
          Ração
        </h1>
             <button
  onClick={() => router.back()}
  className="btn-primary text-xs flex items-center gap-1"
>
  Voltar <ArrowUDownLeftIcon size={14} />
</button>
      </header>

      {/* KPIs */}
      <section className="grid md:grid-cols-4 gap-4">
        <div className="card-easy">
          <p className="text-[11px] text-muted">Hoje</p>
          <p className="text-2xl font-bold">{totalHoje} kg</p>
        </div>
        <div className="card-easy">
          <p className="text-[11px] text-muted">7 dias</p>
          <p className="text-2xl font-bold">{totalSemana} kg</p>
        </div>
        <div className="card-easy">
          <p className="text-[11px] text-muted">Mês</p>
          <p className="text-2xl font-bold">{totalMes} kg</p>
        </div>
        <div className="card-easy">
          <p className="text-[11px] text-muted">Total geral</p>
          <p className="text-2xl font-bold">{totalGeral} kg</p>
        </div>
      </section>

      {/* Form + Lista */}
      <section className="grid lg:grid-cols-3 gap-4">

        {/* FORM */}
        <div className="card-easy">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <ChartLineUp size={16} weight="fill" />
            Registrar uso de ração
          </h2>

          <form onSubmit={handleSalvar} className="space-y-3 text-sm">
            {/* DATA */}
            <div>
              <label className="text-[11px] text-muted flex items-center gap-2 mb-1">
                <CalendarBlank size={12} /> Data
              </label>
              <input
                type="date"
                value={dataRacao}
                onChange={(e) => setDataRacao(e.target.value)}
              />
            </div>

            {/* QUANTIDADE */}
            <div>
              <label className="text-[11px] text-muted flex items-center gap-2 mb-1">
                <Barbell size={12} /> Quantidade (kg)
              </label>
              <input
                type="number"
                min={0}
                value={quantidadeKg}
                onChange={(e) => setQuantidadeKg(e.target.value)}
              />
            </div>

            {/* GALPÃO */}
            <div>
              <label className="text-[11px] text-muted flex items-center gap-2 mb-1">
                <Barn size={12} /> Galpão
              </label>
              <select
                value={galpaoSelecionado}
                onChange={(e) => setGalpaoSelecionado(e.target.value)}
              >
                <option value="">Nenhum</option>
                {galpoes.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome} — {g.loteAtualCodigo || "Sem lote"}
                  </option>
                ))}
              </select>
            </div>

            {/* TIPO */}
            <div>
              <label className="text-[11px] text-muted flex items-center gap-2 mb-1">
                <Tag size={12} /> Tipo de ração
              </label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="Inicial">Inicial</option>
                <option value="Crescimento">Crescimento</option>
                <option value="Recria">Recria</option>
                <option value="Postura">Postura</option>
                <option value="Caipira">Caipira</option>
                <option value="Farelada">Farelada</option>
                <option value="Peletizada">Peletizada</option>
              </select>
            </div>

            {/* OBS */}
            <div>
              <label className="text-[11px] text-muted flex items-center gap-2 mb-1">
                <Notebook size={12} /> Observações
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Detalhes adicionais (marca, lote, ajuste, etc.)"
              />
            </div>

            {/* BOTÃO */}
            <button
              type="submit"
              className="btn-primary text-xs flex items-center justify-center gap-1 mt-2"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Registrar"}
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        {/* LISTA */}
        <div className="card-easy lg:col-span-2">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Bird size={16} weight="fill" />
            Registros de ração
          </h2>

          {registros.length === 0 && (
            <p className="text-sm text-muted">Nenhum registro ainda.</p>
          )}

          {registros.length > 0 && (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-left text-[11px] text-muted border-b border-[var(--color-border)]">
                    <th className="py-2">Data</th>
                    <th className="py-2">Galpão / Lote</th>
                    <th className="py-2">Tipo</th>
                    <th className="py-2 text-right">Quantidade</th>
                    <th className="py-2">Obs.</th>
                  </tr>
                </thead>

                <tbody>
                  {registros.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[var(--color-border)]/50 last:border-0"
                    >
                      <td className="py-2">{formatar(r.data)}</td>

                      <td className="py-2 text-[11px]">
                        {r.galpaoId ? (
                          <>
                            {r.galpaoId}
                            {r.loteCodigo ? ` — ${r.loteCodigo}` : ""}
                          </>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      <td className="py-2">{r.tipo || "—"}</td>

                      <td className="py-2 text-right font-semibold">
                        {r.quantidadeKg} kg
                      </td>

                      <td className="py-2 text-muted max-w-[200px] truncate">
                        {r.observacoes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
