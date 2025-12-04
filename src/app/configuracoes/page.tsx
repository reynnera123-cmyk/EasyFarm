"use client";

import { useThemeEasyFarm } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

const THEMES = [
  {
    id: "easyfarm",
    nome: "EasyFarm Verde",
    descricao: "Tema oficial, baseado no verde da granja.",
    badge: "Padrão",
  },
  {
    id: "corporate",
    nome: "Corporate Azul",
    descricao: "Visual mais corporativo, com azul e verde.",
  },
  {
    id: "agro",
    nome: "Agro Laranja",
    descricao: "Foco em contraste agro, laranja + verde.",
  },
  {
    id: "premium",
    nome: "Premium Cinza",
    descricao: "Estilo mais neutro e minimalista.",
  },
] as const;

export default function ConfiguracoesPage() {
  const { theme, mode, setTheme, toggleMode } = useThemeEasyFarm();
  const router = useRouter();

  return (
    <div className="min-h-screen p-6 space-y-6">

      {/* BOTÃO VOLTAR */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-3"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <h1 className="text-2xl font-bold mb-2">Configurações</h1>
      <h2 className="text-lg font-semibold">Aparência</h2>

      {/* modo claro/escuro */}
      <div className="card-easy p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="font-medium">Modo de exibição</p>
          <p className="text-sm text-muted">
            Atual: {mode === "light" ? "Claro" : "Escuro"} (detecta o sistema,
            mas você pode alternar manualmente).
          </p>
        </div>
        <button onClick={toggleMode} className="btn-primary text-sm">
          Alternar para {mode === "light" ? "modo escuro" : "modo claro"}
        </button>
      </div>

      {/* escolha de tema */}
      <div className="card-easy p-4 space-y-3">
        <p className="font-medium mb-2">Tema de cores</p>

        <div className="grid gap-3 md:grid-cols-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id as any)}
              className={`text-left border rounded-xl px-4 py-3 transition-colors ${
                theme === t.id
                  ? "border-(--color-accent) bg-(--color-accent-soft)"
                  : "border-(--color-border) bg-(--color-surface)"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{t.nome}</span>
                {t.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--color-accent-soft) text-(--color-accent-strong)">
                    {t.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">{t.descricao}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
