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
  setDoc,
  Timestamp,
  updateDoc,
  where,
  deleteDoc, // ← ADICIONADO
} from "firebase/firestore";

import {
  Barn,
  Bird,
  PlusCircle,
  Notebook,
  ArrowRight,
} from "@/components/icons";
import { ArrowUDownLeftIcon, BarnIcon, BirdIcon } from "@phosphor-icons/react";


type LoteAtivo = {
  id: string;
  codigo: string;
  dataEntrada: Timestamp;
  quantidadeInicial: number;
  quantidadeAtual: number;
  observacoes?: string | null;
};

type GalpaoLista = {
  id: string;
  nome: string;
  status: string;
  tipo?: string | null;
  capacidade?: number;
  localizacao?: string | null;
  observacoes?: string | null;
  loteAtual?: LoteAtivo | null;
};

export default function GalpoesPage() {
  const { companyId } = useParams() as { companyId: string };
  const router = useRouter();

  const [galpoes, setGalpoes] = useState<GalpaoLista[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [totalGalpoes, setTotalGalpoes] = useState(0);
  const [galpoesAtivos, setGalpoesAtivos] = useState(0);
  const [capacidadeTotal, setCapacidadeTotal] = useState(0);
  const [avesAtivas, setAvesAtivas] = useState(0);

  // MODAL GALPÃO
  const [mostrarModalGalpao, setMostrarModalGalpao] = useState(false);
  const [nomeGalpao, setNomeGalpao] = useState("");
  const [tipoGalpao, setTipoGalpao] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [obsGalpao, setObsGalpao] = useState("");
  const [salvandoGalpao, setSalvandoGalpao] = useState(false);

  // MODAL LOTE
  const [galpaoSelecionado, setGalpaoSelecionado] =
    useState<GalpaoLista | null>(null);
  const [dataEntrada, setDataEntrada] = useState("");
  const [qtdInicial, setQtdInicial] = useState("");
  const [obsLote, setObsLote] = useState("");
  const [salvandoLote, setSalvandoLote] = useState(false);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
    });
    return () => unsub();
  }, [router]);
async function handleSalvarGalpao(e: any) {
    e.preventDefault();

    if (!nomeGalpao) {
      alert("Informe o nome do galpão.");
      return;
    }

    setSalvandoGalpao(true);

    try {
      const ref = collection(db, `companies/${companyId}/galpoes`);
      const snap = await getDocs(ref);
      const ids = snap.docs.map((d) => d.id);

      const novoId = proximoIdGalpao(ids);

      await setDoc(doc(ref, novoId), {
        nome: nomeGalpao,
        tipo: tipoGalpao || null,
        capacidade: Number(capacidade || 0),
        localizacao: localizacao || null,
        observacoes: obsGalpao || null,
        status: "ativo",
        criadoEm: serverTimestamp(),
      });

      setMostrarModalGalpao(false);
      setNomeGalpao("");
      setTipoGalpao("");
      setCapacidade("");
      setLocalizacao("");
      setObsGalpao("");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar galpão.");
    } finally {
      setSalvandoGalpao(false);
      location.reload();
    }
  }


  // FUNÇÃO EXCLUIR GALPÃO
  async function handleExcluirGalpao(g: GalpaoLista) {
    const ok = confirm(`Deseja realmente excluir o galpão "${g.nome}"?`);
    if (!ok) return;

    try {
      await deleteDoc(doc(db, `companies/${companyId}/galpoes/${g.id}`));
      alert("Galpão excluído!");
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir galpão.");
    }
  }


  // helpers
  function formatarData(ts: Timestamp) {
    return ts.toDate().toLocaleDateString("pt-BR");
  }

  function calcularIdade(ts: Timestamp) {
    const d = ts.toDate();
    const hoje = new Date();
    const diff = hoje.getTime() - d.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (dias < 7) return `${dias} dias`;
    return `${Math.floor(dias / 7)} semanas`;
  }

  function proximoIdGalpao(ids: string[]): string {
    let max = 0;
    ids.forEach((id) => {
      const m = id.match(/^G(\d{2,})$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return `G${String(max + 1).padStart(2, "0")}`;
  }

  async function carregarLoteAtivo(companyId: string, galpaoId: string) {
    const ref = collection(
      db,
      `companies/${companyId}/galpoes/${galpaoId}/lotes`
    );
    const q = query(ref, where("status", "==", "ativo"));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const d = snap.docs[0];
    const data = d.data() as any;

    return {
      id: d.id,
      codigo: data.codigo,
      dataEntrada: data.dataEntrada,
      quantidadeInicial: data.quantidadeInicial,
      quantidadeAtual: data.quantidadeAtual ?? data.quantidadeInicial,
      observacoes: data.observacoes || null,
    } as LoteAtivo;
  }

  // CARREGAR GALPÕES
  useEffect(() => {
    async function carregar() {
      setCarregando(true);

      const galpoesRef = collection(db, `companies/${companyId}/galpoes`);
      const qGalp = query(galpoesRef, orderBy("nome", "asc"));
      const snap = await getDocs(qGalp);

      const listaBase = snap.docs.map((d) => ({
        id: d.id,
        nome: (d.data() as any).nome || d.id,
        status: (d.data() as any).status || "ativo",
        tipo: (d.data() as any).tipo || null,
        capacidade: Number((d.data() as any).capacidade || 0),
        localizacao: (d.data() as any).localizacao || null,
        observacoes: (d.data() as any).observacoes || null,
      })) as GalpaoLista[];

      const listaComLotes: GalpaoLista[] = [];
      for (const g of listaBase) {
        const lote = await carregarLoteAtivo(companyId, g.id);
        listaComLotes.push({ ...g, loteAtual: lote });
      }

      setGalpoes(listaComLotes);

      // KPI
      setTotalGalpoes(listaComLotes.length);
      setGalpoesAtivos(listaComLotes.filter((g) => g.status === "ativo").length);
      setCapacidadeTotal(listaComLotes.reduce((a, g) => a + (g.capacidade || 0), 0));
      setAvesAtivas(
        listaComLotes.reduce((a, g) => a + (g.loteAtual?.quantidadeAtual || 0), 0)
      );

      setCarregando(false);
    }

    if (companyId) carregar();
  }, [companyId]);

  // ABRIR MODAL LOTE
  function abrirGerenciarLote(g: GalpaoLista) {
    setGalpaoSelecionado(g);

    if (g.loteAtual) {
      setDataEntrada(g.loteAtual.dataEntrada.toDate().toISOString().slice(0, 10));
      setQtdInicial(String(g.loteAtual.quantidadeInicial));
      setObsLote(g.loteAtual.observacoes || "");
    } else {
      setDataEntrada(new Date().toISOString().slice(0, 10));
      setQtdInicial("");
      setObsLote("");
    }
  }

  // SALVAR LOTE
  async function handleSalvarLote(e: any) {
    e.preventDefault();

    if (!galpaoSelecionado) return;

    const qtd = Number(qtdInicial);
    if (!qtd || qtd <= 0) {
      alert("Quantidade inválida.");
      return;
    }

    setSalvandoLote(true);

    try {
      const [ano, mes, dia] = dataEntrada.split("-").map(Number);
      const ts = Timestamp.fromDate(new Date(ano, mes - 1, dia));

      const lotesRef = collection(
        db,
        `companies/${companyId}/galpoes/${galpaoSelecionado.id}/lotes`
      );
      const snap = await getDocs(lotesRef);
      const codigo = `${galpaoSelecionado.id}-L${String(snap.size + 1).padStart(
        2,
        "0"
      )}-${new Date().getFullYear()}`;

      // ENCERRAR LOTE ATUAL
      if (galpaoSelecionado.loteAtual) {
        const loteRef = doc(
          db,
          `companies/${companyId}/galpoes/${galpaoSelecionado.id}/lotes/${galpaoSelecionado.loteAtual.id}`
        );
        await updateDoc(loteRef, {
          status: "encerrado",
          encerradoEm: serverTimestamp(),
        });
      }

      // CRIA NOVO LOTE
      const novo = await addDoc(lotesRef, {
        codigo,
        dataEntrada: ts,
        quantidadeInicial: qtd,
        quantidadeAtual: qtd,
        observacoes: obsLote || null,
        status: "ativo",
        criadoEm: serverTimestamp(),
      });

      const refGalpao = doc(
        db,
        `companies/${companyId}/galpoes/${galpaoSelecionado.id}`
      );
      await updateDoc(refGalpao, { loteAtualId: novo.id });

      setGalpaoSelecionado(null);
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar lote.");
    } finally {
      setSalvandoLote(false);
    }
  }

  // ENCERRAR LOTE ATUAL
  async function encerrarLoteAtual() {
    if (!galpaoSelecionado?.loteAtual) return;

    const ok = confirm("Encerrar lote atual?");
    if (!ok) return;

    const loteRef = doc(
      db,
      `companies/${companyId}/galpoes/${galpaoSelecionado.id}/lotes/${galpaoSelecionado.loteAtual.id}`
    );

    await updateDoc(loteRef, {
      status: "encerrado",
      encerradoEm: serverTimestamp(),
    });

    const refGalpao = doc(
      db,
      `companies/${companyId}/galpoes/${galpaoSelecionado.id}`
    );
    await updateDoc(refGalpao, { loteAtualId: null });

    setGalpaoSelecionado(null);
    location.reload();
  }

  // RENDER
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
              <Barn weight="fill" className="text-[var(--color-accent)]" />
            </span>
            Galpões & Lotes
          </h1>
          <p className="text-sm text-muted">
            Estrutura, capacidade, lotes ativos e situação das aves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/empresa/${companyId}/racao`}
            className="btn-primary text-xs flex items-center gap-1"
          >
            Ração <BarnIcon size={14} />
          </Link>

          <Link
            href={`/empresa/${companyId}/mortalidade`}
            className="btn-primary text-xs flex items-center gap-1"
          >
            Mortalidade <BirdIcon size={14} />
          </Link>

          <button
            onClick={() => router.back()}
            className="btn-primary text-xs flex items-center gap-1"
          >
            Voltar <ArrowUDownLeftIcon size={14} />
          </button>
        </div>
      </header>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="card-easy">
          <p className="text-[11px] text-muted">Total de galpões</p>
          <p className="text-2xl font-bold">{totalGalpoes}</p>
        </div>

        <div className="card-easy">
          <p className="text-[11px] text-muted">Galpões ativos</p>
          <p className="text-2xl font-bold">{galpoesAtivos}</p>
        </div>

        <div className="card-easy">
          <p className="text-[11px] text-muted">Capacidade total</p>
          <p className="text-2xl font-bold">{capacidadeTotal}</p>
        </div>

        <div className="card-easy">
          <p className="text-[11px] text-muted">Aves nos lotes ativos</p>
          <p className="text-2xl font-bold">{avesAtivas}</p>
        </div>
      </section>

      {/* LISTA */}
      <section className="space-y-3">
        <button
          onClick={() => setMostrarModalGalpao(true)}
          className="btn-primary text-xs flex items-center gap-1"
        >
          <PlusCircle size={14} />
          Novo galpão
        </button>

        {galpoes.map((g) => (
          <div
            key={g.id}
            className="card-easy flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            {/* ESQUERDA */}
            <div className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
                <Barn size={24} weight="fill" className="text-[var(--color-accent)]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">
                  {g.nome} <span className="text-[11px] text-muted">({g.id})</span>
                </h2>
                <p className="text-[11px] text-muted">
                  Capacidade: {g.capacidade} aves
                </p>
                {g.localizacao && (
                  <p className="text-[11px] text-muted">Local: {g.localizacao}</p>
                )}
              </div>
            </div>

            {/* CENTRO */}
            <div className="flex-1 md:px-4">
              {g.loteAtual ? (
                <div className="border border-dashed border-[var(--color-border)] rounded-lg px-3 py-2 text-[11px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Bird size={14} weight="fill" />
                    <span className="font-semibold text-[12px]">
                      Lote: {g.loteAtual.codigo}
                    </span>
                  </div>
                  <p className="text-muted">
                    Entrada: {formatarData(g.loteAtual.dataEntrada)} • Idade:{" "}
                    {calcularIdade(g.loteAtual.dataEntrada)}
                  </p>
                  <p className="text-muted">
                    Aves iniciais: {g.loteAtual.quantidadeInicial} • Atuais:{" "}
                    {g.loteAtual.quantidadeAtual}
                  </p>
                  {g.loteAtual.observacoes && (
                    <p className="text-muted">Obs.: {g.loteAtual.observacoes}</p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-muted">Nenhum lote ativo neste galpão.</p>
              )}
            </div>

            {/* DIREITA */}
            <div className="flex flex-col gap-2 min-w-[160px]">
              <button
                type="button"
                className="btn-primary text-xs flex items-center justify-center gap-1"
                onClick={() => abrirGerenciarLote(g)}
              >
                <Notebook size={14} />
                Gerenciar lote
              </button>

              <Link
                href={`/empresa/${companyId}/racao?galpao=${g.id}`}
                className="btn-secondary text-xs flex items-center justify-center gap-1"
              >
                Ração <ArrowRight size={12} />
              </Link>

              <Link
                href={`/empresa/${companyId}/mortalidade?galpao=${g.id}`}
                className="btn-secondary text-xs flex items-center justify-center gap-1"
              >
                Mortalidade <ArrowRight size={12} />
              </Link>

              {/* 🔥 ADICIONADO: BOTÃO DE EXCLUIR GALPÃO */}
              <button
                onClick={() => handleExcluirGalpao(g)}
                className="btn-secondary text-xs flex items-center justify-center gap-1 text-red-600"
              >
                Excluir galpão
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* MODAL GALPÃO */}
      {mostrarModalGalpao && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
          <div className="card-easy w-full max-w-lg">
            <h2 className="text-sm font-semibold mb-2">Novo galpão</h2>
            <form onSubmit={handleSalvarGalpao} className="space-y-3 text-xs">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted">Nome</label>
                  <input
                    className="input-easy"
                    value={nomeGalpao}
                    onChange={(e) => setNomeGalpao(e.target.value)}
                    placeholder="Ex.: Galpão 1"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-muted">Tipo</label>
                  <input
                    className="input-easy"
                    value={tipoGalpao}
                    onChange={(e) => setTipoGalpao(e.target.value)}
                    placeholder="Poedeiras, corte..."
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted">
                    Capacidade (aves)
                  </label>
                  <input
                    type="number"
                    className="input-easy"
                    value={capacidade}
                    onChange={(e) => setCapacidade(e.target.value)}
                    placeholder="Ex.: 3000"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-muted">Localização</label>
                  <input
                    className="input-easy"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-muted">Observações</label>
                <textarea
                  className="input-easy"
                  rows={3}
                  value={obsGalpao}
                  onChange={(e) => setObsGalpao(e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalGalpao(false)}
                  className="text-xs underline text-muted"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvandoGalpao}
                  className="btn-primary text-xs"
                >
                  {salvandoGalpao ? "Salvando..." : "Salvar galpão"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOTE */}
      {galpaoSelecionado && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
          <div className="card-easy w-full max-w-lg">
            <h2 className="text-sm font-semibold mb-2">
              {galpaoSelecionado.loteAtual ? "Editar lote" : "Novo lote"}
            </h2>

            <form onSubmit={handleSalvarLote} className="space-y-3 text-xs">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted">Data de entrada</label>
                  <input
                    type="date"
                    className="input-easy"
                    value={dataEntrada}
                    onChange={(e) => setDataEntrada(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-muted">
                    Quantidade inicial
                  </label>
                  <input
                    type="number"
                    className="input-easy"
                    value={qtdInicial}
                    onChange={(e) => setQtdInicial(e.target.value)}
                    placeholder="Ex.: 200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-muted">Observações</label>
                <textarea
                  className="input-easy"
                  rows={3}
                  value={obsLote}
                  onChange={(e) => setObsLote(e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-2">
                {galpaoSelecionado.loteAtual && (
                  <button
                    type="button"
                    onClick={encerrarLoteAtual}
                    className="text-xs text-red-600 underline"
                  >
                    Encerrar lote
                  </button>
                )}

                <button
                  type="button"
                  className="text-xs underline text-muted"
                  onClick={() => setGalpaoSelecionado(null)}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-primary text-xs" disabled={salvandoLote}>
                  {salvandoLote
                    ? "Salvando..."
                    : galpaoSelecionado.loteAtual
                    ? "Atualizar"
                    : "Criar lote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
