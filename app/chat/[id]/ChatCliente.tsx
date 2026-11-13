"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { dentroDoHorario } from "../../lib/horario";

type Status = "enviada" | "entregue" | "lida";

type Msg = {
  id: number;
  minha: boolean;
  texto?: string;
  arquivo?: { nome: string; tamanho: string; tipo: "pdf" | "imagem"; url?: string };
  hora: string;
  status?: Status;
};

const nomes: Record<string, string> = {
  "1": "Equipe Logística",
  "2": "Ana Costa",
  "3": "Projetos",
  "4": "Suporte",
  "5": "Marketing",
  "6": "Geral",
};

const inicial: Msg[] = [
  { id: 1, minha: false, texto: "Bom dia! Você conseguiu verificar o status do pedido?", hora: "09:16" },
  { id: 2, minha: true, texto: "Sim! Já atualizei no sistema. Está em separação.", hora: "09:18", status: "lida" },
  { id: 3, minha: false, texto: "Perfeito! Qualquer novidade me avisa.", hora: "09:20" },
  { id: 4, minha: false, arquivo: { nome: "Pedido_4521.pdf", tamanho: "2,4 MB", tipo: "pdf" }, hora: "09:22" },
];

function agora() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatarTamanho(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function Ticks({ status }: { status?: Status }) {
  if (!status) return null;
  const cor = status === "lida" ? "text-sky-300" : "text-white/70";
  return <span className={`ml-1 text-[11px] ${cor}`}>{status === "enviada" ? "✓" : "✓✓"}</span>;
}

export default function ChatCliente({ id }: { id: string }) {
  const nome = nomes[id] ?? "Conversa";
  const [msgs, setMsgs] = useState<Msg[]>(inicial);
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");
  const arquivoRef = useRef<HTMLInputElement>(null);

  function simularStatus(msgId: number) {
    setTimeout(() => {
      setMsgs((m) => m.map((x) => (x.id === msgId ? { ...x, status: "entregue" } : x)));
    }, 1000);
    setTimeout(() => {
      setMsgs((m) => m.map((x) => (x.id === msgId ? { ...x, status: "lida" } : x)));
    }, 2500);
  }

  function adicionar(parcial: Partial<Msg>) {
    if (!dentroDoHorario()) {
      setAviso("Fora do horário de uso (8h às 18h). Não é possível enviar.");
      return;
    }
    setAviso("");
    const novoId = Date.now();
    setMsgs((m) => [...m, { id: novoId, minha: true, hora: agora(), status: "enviada", ...parcial }]);
    simularStatus(novoId);
  }

  function enviarTexto() {
    const t = texto.trim();
    if (!t) return;
    adicionar({ texto: t });
    setTexto("");
  }

  function escolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type === "application/pdf") {
      adicionar({ arquivo: { nome: f.name, tamanho: formatarTamanho(f.size), tipo: "pdf" } });
    } else if (f.type === "image/jpeg") {
      adicionar({
        arquivo: { nome: f.name, tamanho: formatarTamanho(f.size), tipo: "imagem", url: URL.createObjectURL(f) },
      });
    } else {
      setAviso("Só é permitido enviar arquivos PDF e imagens JPEG.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center">
      <div className="flex min-h-screen w-full max-w-sm flex-col">
        <header className="flex items-center gap-3 bg-[#0e1f7a] px-4 py-4 text-white">
          <Link href="/conversas" aria-label="Voltar" className="text-xl font-bold">
            ←
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-base font-bold">
            {nome.charAt(0)}
          </div>
          <div>
            <p className="text-base font-bold leading-tight">{nome}</p>
            <p className="text-xs font-medium text-emerald-300">Online</p>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-28">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.minha ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[15px] font-medium shadow-sm ${
                  m.minha ? "rounded-br-sm bg-[#3d3fe8] text-white" : "rounded-bl-sm bg-white text-slate-800"
                }`}
              >
                {m.texto ? <p>{m.texto}</p> : null}

                {m.arquivo?.tipo === "pdf" ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-9 items-center justify-center rounded bg-red-500 text-[10px] font-bold text-white">
                      PDF
                    </div>
                    <div>
                      <p className="text-sm font-bold">{m.arquivo.nome}</p>
                      <p className={`text-xs ${m.minha ? "text-white/70" : "text-slate-500"}`}>{m.arquivo.tamanho}</p>
                    </div>
                  </div>
                ) : null}

                {m.arquivo?.tipo === "imagem" ? (
                  <div>
                    {m.arquivo.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.arquivo.url} alt={m.arquivo.nome} className="max-h-48 rounded-lg" />
                    ) : null}
                    <p className="mt-1 text-xs">{m.arquivo.nome}</p>
                  </div>
                ) : null}

                <p className={`mt-1 text-right text-[11px] ${m.minha ? "text-white/70" : "text-slate-400"}`}>
                  {m.hora}
                  {m.minha ? <Ticks status={m.status} /> : null}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-1/2 w-full max-w-sm -translate-x-1/2 border-t border-slate-200 bg-white px-3 py-3">
          {aviso ? <p className="mb-2 text-center text-xs font-semibold text-red-600">{aviso}</p> : null}
          <div className="flex items-center gap-2">
            <input
              ref={arquivoRef}
              type="file"
              accept="application/pdf,image/jpeg"
              onChange={escolherArquivo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => arquivoRef.current?.click()}
              aria-label="Anexar PDF ou JPEG"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-[#1e2a78] transition active:scale-90"
            >
              📎
            </button>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarTexto()}
              placeholder="Digite uma mensagem..."
              className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-[15px] font-medium text-slate-900 placeholder:text-slate-500 outline-none"
            />
            <button
              type="button"
              onClick={enviarTexto}
              aria-label="Enviar"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3d3fe8] text-lg text-white transition active:scale-90"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}