"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

import {
  Egg,
  Bird,
  Barn,
  ChartLineUp,
  ArrowRight,
  CalendarBlank,
  Tag,
  Notebook,
} from "@/components/icons";
import { ArrowUDownLeftIcon } from "@phosphor-icons/react";

type ProducaoOvos = {
  id: string;
  data: Timestamp;
  quantidade: number;
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

export default function ProducaoOvosPage() {
  const { companyId } = useParams() as { companyId: string };
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [producoes, setProducoes] = useState<ProducaoOvos[]>([]);
  const [galpoes, setGalpoes] = useState<Galpao[]>([]);

  const [dataProducao, setDataProducao] = useState<string>(() => {
    const hoje = new Date();
    const y = hoje.getFullYear();
    const m = String(hoje.getMonth() + 1).padStart(2, "0");
    const d = String(hoje.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [quantidade, setQuantidade] = useState("");
  const [galpaoSelecionado, setGalpaoSelecionado] = useState("");
  const [tipoOvo, setTipoOvo] = useState("Comercial");
  const [observacoes, setObservacoes] = useState("");

  const [totalHoje, setTotalHoje] = useState(0);
  const [totalSemana, setTotalSemana] = useState(0);
  const [totalMes, setTotalMes] = useState(0);
  const [totalGeral, setTotalGeral] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    async function carregarTudo() {
      setCarregando(true);

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

      const producoesRef = collection(db, `companies/${companyId}/ovos`);
      const producoesQuery = query(producoesRef, orderBy("data", "desc"));
      const producoesSnap = await getDocs(producoesQuery);

      const lista = producoesSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          data: data.data,
          quantidade: Number(data.quantidade || 0),
          galpaoId: data.galpaoId || null,
          loteCodigo: data.loteCodigo || null,
          tipo: data.tipo || null,
          observacoes: data.observacoes || null,
        };
      });

      setProducoes(lista);
      calcularKPIs(lista);

      setCarregando(false);
    }

    carregarTudo();
  }, [companyId]);

  function calcularKPIs(lista: ProducaoOvos[]) {
    const hoje = new Date();
    const hojeDia = hoje.getDate();
    const hojeMes = hoje.getMonth();
    const hojeAno = hoje.getFullYear();

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 6);

    const inicioMes = new Date(hojeAno, hojeMes, 1);

    let somaHoje = 0;
    let somaSemana = 0;
    let somaMes = 0;
    let somaGeral = 0;

    lista.forEach((p) => {
      const d = p.data.toDate();
      const qtd = p.quantidade || 0;

      somaGeral += qtd;

      if (
        d.getDate() === hojeDia &&
        d.getMonth() === hojeMes &&
        d.getFullYear() === hojeAno
      )
        somaHoje += qtd;

      if (d >= inicioSemana && d <= hoje) somaSemana += qtd;

      if (d >= inicioMes && d <= hoje) somaMes += qtd;
    });

    setTotalHoje(somaHoje);
    setTotalSemana(somaSemana);
    setTotalMes(somaMes);
    setTotalGeral(somaGeral);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!quantidade) {
      alert("Informe a quantidade de ovos.");
      return;
    }

    setSalvando(true);

    const [ano, mes, dia] = dataProducao.split("-").map(Number);
    const dataTs = Timestamp.fromDate(new Date(ano, mes - 1, dia));

    let loteCodigo: string | null = null;
    if (galpaoSelecionado) {
      const g = galpoes.find((x) => x.id === galpaoSelecionado);
      loteCodigo = g?.loteAtualCodigo || null;
    }

    await addDoc(collection(db, `companies/${companyId}/ovos`), {
      companyId,
      data: dataTs,
      quantidade: Number(quantidade),
      galpaoId: galpaoSelecionado || null,
      loteCodigo,
      tipo: tipoOvo,
      observacoes: observacoes || null,
      criadoEm: serverTimestamp(),
    });

    const prods = await getDocs(
      query(
        collection(db, `companies/${companyId}/ovos`),
        orderBy("data", "desc")
      )
    );

    const lista = prods.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        data: data.data,
        quantidade: data.quantidade,
        galpaoId: data.galpaoId,
        loteCodigo: data.loteCodigo,
        tipo: data.tipo,
        observacoes: data.observacoes,
      };
    });

    setProducoes(lista);
    calcularKPIs(lista);

    setQuantidade("");
    setObservacoes("");
    setSalvando(false);
  }

  function formatar(ts: Timestamp) {
    return ts.toDate().toLocaleDateString();
  }

  return (
    <div className="min-h-screen px-6 py-5 space-y-6">

      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
            <Egg weight="fill" className="text-[var(--color-accent)]" />
          </span>
          Produção de Ovos 
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
          <p className="text-2xl font-bold">{totalHoje}</p>
        </div>
        <div className="card-easy">
          <p className="text-[11px] text-muted">Últimos 7 dias</p>
          <p className="text-2xl font-bold">{totalSemana}</p>
        </div>
        <div className="card-easy">
          <p className="text-[11px] text-muted">Mês atual</p>
          <p className="text-2xl font-bold">{totalMes}</p>
        </div>
        <div className="card-easy">
          <p className="text-[11px] text-muted">Total Geral</p>
          <p className="text-2xl font-bold">{totalGeral}</p>
        </div>
      </section>

      {/* FORMULÁRIO + LISTA */}
      <section className="grid lg:grid-cols-3 gap-4">
        <div className="card-easy">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <ChartLineUp size={16} weight="fill" />
            Registrar produção
          </h2>

          <form onSubmit={handleSalvar} className="space-y-3 text-sm">
            <div>
              <label className="text-[11px] text-muted flex gap-2 items-center mb-1">
                <CalendarBlank size={12} /> Data
              </label>
              <input
                type="date"
                value={dataProducao}
                onChange={(e) => setDataProducao(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] text-muted flex gap-2 items-center mb-1">
                <Egg size={12} /> Quantidade
              </label>
              <input
                type="number"
                min={0}
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

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

            <div>
              <label className="text-[11px] text-muted flex items-center gap-2 mb-1">
                <Tag size={12} /> Tipo
              </label>
              <select
                value={tipoOvo}
                onChange={(e) => setTipoOvo(e.target.value)}
              >
                <option value="Comercial">Comercial</option>
                <option value="Caipira">Caipira</option>
                <option value="Grande">Grande</option>
                <option value="Médio">Médio</option>
                <option value="Pequeno">Pequeno</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-muted flex items-center gap-2 mb-1">
                <Notebook size={12} /> Observações
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary text-xs flex items-center justify-center gap-1 mt-2"
            >
              Registrar <ArrowRight size={13} />
            </button>
          </form>
        </div>

        <div className="card-easy lg:col-span-2">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Bird size={16} weight="fill" />
            Últimos registros
          </h2>

          {producoes.length === 0 && (
            <p className="text-sm text-muted">
              Nenhuma produção registrada ainda.
            </p>
          )}

          {producoes.length > 0 && (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-left text-[11px] text-muted border-b border-[var(--color-border)]">
                    <th className="py-2">Data</th>
                    <th className="py-2">Galpão / Lote</th>
                    <th className="py-2">Tipo</th>
                    <th className="py-2 text-right">Qtde</th>
                    <th className="py-2">Obs.</th>
                  </tr>
                </thead>
                <tbody>
                  {producoes.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-[var(--color-border)]/50 last:border-0"
                    >
                      <td className="py-2">{formatar(p.data)}</td>
                      <td className="py-2 text-[11px]">
                        {p.galpaoId ? (
                          <>
                            {p.galpaoId}
                            {p.loteCodigo ? ` — ${p.loteCodigo}` : ""}
                          </>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="py-2">{p.tipo || "—"}</td>
                      <td className="py-2 text-right font-semibold">
                        {p.quantidade}
                      </td>
                      <td className="py-2 text-muted max-w-[200px] truncate">
                        {p.observacoes || "—"}
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
