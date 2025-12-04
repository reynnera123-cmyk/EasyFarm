"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";

import {
  CheckCircle,
  Barn,
  Bird,
  CalendarBlank,
  Notebook,
  ArrowRight,
  Tag,
  ChartLineUp,
} from "@/components/icons";
import { ArrowUDownLeftIcon } from "@phosphor-icons/react";

type AplicacaoVacina = {
  id: string;
  data: Timestamp;
  vacina: string;
  dose: string;
  galpaoId?: string | null;
  loteCodigo?: string | null;
  observacoes?: string | null;
};

type Galpao = {
  id: string;
  nome: string;
  loteAtualCodigo?: string | null;
};

export default function VacinasPage() {
  const { companyId } = useParams();
  const router = useRouter();

  // loading
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // dados
  const [registros, setRegistros] = useState<AplicacaoVacina[]>([]);
  const [galpoes, setGalpoes] = useState<Galpao[]>([]);

  // formulário
  const [dataAplicacao, setDataAplicacao] = useState(() => {
    const hoje = new Date();
    const y = hoje.getFullYear();
    const m = String(hoje.getMonth() + 1).padStart(2, "0");
    const d = String(hoje.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [vacina, setVacina] = useState("");
  const [dose, setDose] = useState("");
  const [galpaoSelecionado, setGalpaoSelecionado] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // KPIs
  const [totalHoje, setTotalHoje] = useState(0);
  const [totalSemana, setTotalSemana] = useState(0);
  const [totalMes, setTotalMes] = useState(0);
  const [totalGeral, setTotalGeral] = useState(0);

  // ========================
  // Auth
  // ========================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  // ========================
  // Carregar dados
  // ========================
  useEffect(() => {
    async function carregar() {
      setCarregando(true);

      // galpões
      const galSnap = await getDocs(
        collection(db, `companies/${companyId}/galpoes`)
      );
      const listaGalpoes = galSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          nome: data.nome || d.id,
          loteAtualCodigo: data.loteAtualCodigo || null,
        };
      });
      setGalpoes(listaGalpoes);

      // vacinas
      const vacRef = collection(db, `companies/${companyId}/vacinas`);
      const vacQuery = query(vacRef, orderBy("data", "desc"));
      const vacSnap = await getDocs(vacQuery);

      const lista = vacSnap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          data: data.data,
          vacina: data.vacina,
          dose: data.dose,
          galpaoId: data.galpaoId || null,
          loteCodigo: data.loteCodigo || null,
          observacoes: data.observacoes || null,
        };
      });

      setRegistros(lista);
      calcularKPIs(lista);
      setCarregando(false);
    }
    carregar();
  }, [companyId]);

  // ========================
  // KPIs
  // ========================
  function calcularKPIs(lista: AplicacaoVacina[]) {
    const hoje = new Date();
    const hojeDia = hoje.getDate();
    const hojeMes = hoje.getMonth();
    const hojeAno = hoje.getFullYear();

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 6);

    const inicioMes = new Date(hojeAno, hojeMes, 1);

    let h = 0,
      s = 0,
      m = 0,
      g = 0;

    lista.forEach((r) => {
      const d = r.data.toDate();
      g += 1;

      if (
        d.getFullYear() === hojeAno &&
        d.getMonth() === hojeMes &&
        d.getDate() === hojeDia
      )
        h++;

      if (d >= inicioSemana && d <= hoje) s++;
      if (d >= inicioMes && d <= hoje) m++;
    });

    setTotalHoje(h);
    setTotalSemana(s);
    setTotalMes(m);
    setTotalGeral(g);
  }

  // ========================
  // SALVAR
  // ========================
  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();

    if (!vacina || !dose) {
      alert("Informe o nome da vacina e a dose.");
      return;
    }

    setSalvando(true);

    const [ano, mes, dia] = dataAplicacao.split("-").map(Number);
    const ts = Timestamp.fromDate(new Date(ano, mes - 1, dia));

    let loteCodigo: string | null = null;

    if (galpaoSelecionado) {
      const g = galpoes.find((x) => x.id === galpaoSelecionado);
      loteCodigo = g?.loteAtualCodigo || null;
    }

    await addDoc(collection(db, `companies/${companyId}/vacinas`), {
      companyId,
      data: ts,
      vacina,
      dose,
      galpaoId: galpaoSelecionado || null,
      loteCodigo,
      observacoes: observacoes || null,
      criadoEm: serverTimestamp(),
    });

    // reload
    const snap = await getDocs(
      query(
        collection(db, `companies/${companyId}/vacinas`),
        orderBy("data", "desc")
      )
    );

    const lista = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        data: data.data,
        vacina: data.vacina,
        dose: data.dose,
        galpaoId: data.galpaoId || null,
        loteCodigo: data.loteCodigo || null,
        observacoes: data.observacoes || null,
      };
    });

    setRegistros(lista);
    calcularKPIs(lista);

    setVacina("");
    setDose("");
    setObservacoes("");
    setSalvando(false);
  }

  // ========================
  // Format
  // ========================
  function formatar(ts: Timestamp) {
    return ts.toDate().toLocaleDateString();
  }

  // ========================
  // UI
  // ========================
  return (
    <div className="min-h-screen px-6 py-5 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
            <CheckCircle weight="fill" className="text-[var(--color-accent)]" />
          </span>
          Aves e Saúde
        </h1>


        {/* LINK PARA MORTALIDADE */}
        <Link
          href={`/empresa/${companyId}/mortalidade`}
          className="btn-primary text-xs flex items-center gap-1"
        >
          <Bird size={14} /> Mortalidade
        </Link>
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
          <p className="text-[11px] text-muted">Aplicações hoje</p>
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
          <p className="text-[11px] text-muted">Total histórico</p>
          <p className="text-2xl font-bold">{totalGeral}</p>
        </div>
      </section>

      {/* Form + Lista */}
      <section className="grid lg:grid-cols-3 gap-4">

        {/* FORM */}
        <div className="card-easy">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <ChartLineUp size={16} weight="fill" />
            Registrar aplicação de vacina
          </h2>

          <form onSubmit={handleSalvar} className="space-y-3 text-sm">

            {/* DATA */}
            <div>
              <label className="text-[11px] text-muted flex items-center gap-1 mb-1">
                <CalendarBlank size={12} /> Data
              </label>
              <input
                type="date"
                value={dataAplicacao}
                onChange={(e) => setDataAplicacao(e.target.value)}
              />
            </div>

            {/* VACINA */}
            <div>
              <label className="text-[11px] text-muted mb-1 flex items-center gap-1">
                <Tag size={12} /> Vacina
              </label>
              <input
                value={vacina}
                onChange={(e) => setVacina(e.target.value)}
                placeholder="Ex.: Newcastle"
              />
            </div>

            {/* DOSE */}
            <div>
              <label className="text-[11px] text-muted mb-1 flex items-center gap-1">
                <Bird size={12} /> Dose
              </label>
              <input
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="Ex.: 0.5 ml"
              />
            </div>

            {/* GALPÃO */}
            <div>
              <label className="text-[11px] text-muted flex items-center gap-1 mb-1">
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

            {/* OBS */}
            <div>
              <label className="text-[11px] text-muted flex items-center gap-1 mb-1">
                <Notebook size={12} /> Observações
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Detalhes adicionais"
              />
            </div>

            {/* BOTÃO */}
            <button
              type="submit"
              className="btn-primary text-xs flex items-center gap-1 mt-2"
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
            Registros de vacinação
          </h2>

          {registros.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma aplicação registrada.</p>
          ) : (
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-left text-[11px] text-muted border-b border-[var(--color-border)]">
                    <th className="py-2">Data</th>
                    <th className="py-2">Vacina</th>
                    <th className="py-2">Galpão / Lote</th>
                    <th className="py-2">Dose</th>
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
                      <td className="py-2">{r.vacina}</td>
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
                      <td className="py-2">{r.dose}</td>
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
