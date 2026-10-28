import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  CircleHelp,
  Code2,
  Command,
  FileText,
  ListTodo,
  LoaderCircle,
  PenLine,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { initialTaskState, taskReducer } from "./task-state";

type AgentId = "code" | "research" | "writer" | "tasks";
type RunState = "idle" | "running" | "completed";

type Agent = {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  color: string;
  icon: typeof Code2;
  prompts: string[];
  result: string;
};

const agents: Agent[] = [
  {
    id: "code",
    name: "Code",
    role: "Desenvolvimento",
    description: "Transforme uma ideia em um próximo passo de código.",
    color: "violet",
    icon: Code2,
    prompts: ["Revisar uma função", "Rascunhar um componente"],
    result:
      "Tudo pronto para começar. No modo real, o agente analisaria seu pedido e devolveria uma proposta de implementação.",
  },
  {
    id: "research",
    name: "Research",
    role: "Pesquisa",
    description: "Organize perguntas e estruture uma pesquisa objetiva.",
    color: "blue",
    icon: Search,
    prompts: ["Comparar duas opções", "Resumir um tema"],
    result:
      "Pesquisa simulada concluída. Sua solicitação foi organizada em tópicos para facilitar a próxima etapa.",
  },
  {
    id: "writer",
    name: "Writer",
    role: "Escrita",
    description: "Dê forma a um rascunho, mensagem ou nova ideia.",
    color: "amber",
    icon: PenLine,
    prompts: ["Escrever um primeiro rascunho", "Ajustar o tom"],
    result:
      "Rascunho simulado concluído. A ideia está pronta para ser refinada com suas instruções.",
  },
  {
    id: "tasks",
    name: "Tasks",
    role: "Organização",
    description: "Quebre um objetivo em pequenas tarefas práticas.",
    color: "mint",
    icon: ListTodo,
    prompts: ["Planejar minha semana", "Dividir um projeto"],
    result:
      "Plano simulado criado. No fluxo real, você receberia uma sequência de etapas claras e acionáveis.",
  },
];

const transition = { type: "spring" as const, stiffness: 420, damping: 34 };

function App() {
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [task, setTask] = useState("");
  const [taskExecution, dispatchTask] = useReducer(taskReducer, initialTaskState);
  const runState = taskExecution.status;
  const submittedTask = taskExecution.task;
  const reducedMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeAgent = agents.find((agent) => agent.id === selectedAgent);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function chooseAgent(id: AgentId) {
    setSelectedAgent((current) => (current === id ? null : id));
    setTask("");
    dispatchTask({ type: "reset" });
  }

  function runTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = task.trim();
    if (!trimmed || !activeAgent) return;

    if (timer.current) clearTimeout(timer.current);
    dispatchTask({ type: "start", task: trimmed });
    timer.current = setTimeout(() => dispatchTask({ type: "complete" }), 1350);
  }

  function closePanel() {
    setSelectedAgent(null);
    setTask("");
    dispatchTask({ type: "reset" });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101116] text-white">
      <div aria-hidden="true" className="ambient ambient-one" />
      <div aria-hidden="true" className="ambient ambient-two" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
        <a href="#" className="brand" aria-label="Dock de Agentes — início">
          <span className="brand-mark"><Sparkles size={16} /></span>
          <span>dock<span className="text-white/45">.agents</span></span>
        </a>
        <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-white/55">
          <span className="live-dot" />
          Protótipo interativo
        </div>
      </header>

      <section className="hero relative z-0 mx-auto flex min-h-[calc(100svh-104px)] max-w-5xl flex-col items-center px-5 pb-48 pt-14 text-center sm:pt-20">
        <div className="eyebrow"><span /> UM NOVO JEITO DE TRABALHAR</div>
        <h1 className="hero-title mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-7xl">
          Suas ideias.
          <br />
          <span className="gradient-text">Seus agentes.</span>
        </h1>
        <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-white/50 sm:text-lg sm:leading-8">
          Um pequeno espaço para grandes começos. Escolha um agente no dock e
          veja sua próxima ideia ganhar forma.
        </p>

        <div className="preview-card mt-14 w-full max-w-[660px] text-left">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="window-lights"><i /><i /><i /></span>
              <span className="text-xs text-white/50">Seu espaço de trabalho</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] text-white/35">
              <Command size={12} /> <span>K</span>
            </span>
          </div>
          <div className="preview-content flex min-h-44 items-center justify-center px-5 py-8">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/70">
                <Sparkles size={19} strokeWidth={1.6} />
              </div>
              <p className="mt-4 text-sm font-medium text-white/80">Tudo começa com uma ideia</p>
              <p className="mt-1.5 text-xs leading-5 text-white/40">
                Passe o cursor ou use Tab para explorar seus agentes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-white/[0.07] px-5 py-3.5">
            <Plus size={15} className="text-white/30" />
            <span className="text-xs text-white/35">O que você quer fazer hoje?</span>
            <span className="ml-auto flex size-7 items-center justify-center rounded-lg bg-white/[0.07] text-white/50">
              <ArrowUp size={14} />
            </span>
          </div>
        </div>
        <div className="mt-8 flex items-center gap-2 text-[11px] text-white/30">
          <span className="h-px w-6 bg-white/15" /> Feito para manter o foco
          <span className="h-px w-6 bg-white/15" />
        </div>
      </section>

      <AnimatePresence>
        {activeAgent && (
          <AgentPanel
            key={activeAgent.id}
            agent={activeAgent}
            task={task}
            runState={runState}
            submittedTask={submittedTask}
            onTaskChange={setTask}
            onSubmit={runTask}
            onClose={closePanel}
            onPrompt={(prompt) => setTask(prompt)}
            reduceMotion={Boolean(reducedMotion)}
          />
        )}
      </AnimatePresence>

      <div
        className="dock-zone fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(18px,env(safe-area-inset-bottom))] pt-8"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setExpanded(false);
          }
        }}
      >
        <motion.nav
          aria-label="Agentes disponíveis"
          className="dock-shell"
          initial={false}
          animate={{ width: expanded ? 338 : 188 }}
          transition={reducedMotion ? { duration: 0 } : transition}
        >
          <div className="flex w-full items-center justify-between gap-1">
            <span className="dock-logo" aria-hidden="true"><Sparkles size={17} /></span>
            {agents.map((agent) => {
              const Icon = agent.icon;
              const active = selectedAgent === agent.id;
              return (
                <button
                  type="button"
                  key={agent.id}
                  className={`dock-button ${active ? "is-active" : ""} agent-${agent.color}`}
                  aria-label={`Abrir agente ${agent.name}`}
                  aria-pressed={active}
                  onClick={() => chooseAgent(agent.id)}
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.span
                        className="dock-label"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={reducedMotion ? { duration: 0 } : { duration: 0.16 }}
                      >
                        {agent.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
            <span className="dock-divider" />
            <button type="button" className="dock-help" aria-label="Ajuda sobre o dock" title="Passe o cursor ou navegue com Tab">
              <CircleHelp size={17} />
            </button>
          </div>
          <motion.div
            aria-hidden="true"
            className="dock-caption"
            animate={{ opacity: expanded ? 1 : 0, height: expanded ? 17 : 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
          >
            SEU TIME, A UM CLIQUE DE DISTÂNCIA
            <ChevronDown size={11} className="ml-1 rotate-180" />
          </motion.div>
        </motion.nav>
      </div>
    </main>
  );
}

type AgentPanelProps = {
  agent: Agent;
  task: string;
  runState: RunState;
  submittedTask: string;
  onTaskChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onPrompt: (prompt: string) => void;
  reduceMotion: boolean;
};

function AgentPanel({
  agent,
  task,
  runState,
  submittedTask,
  onTaskChange,
  onSubmit,
  onClose,
  onPrompt,
  reduceMotion,
}: AgentPanelProps) {
  const Icon = agent.icon;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.section
      role="dialog"
      aria-modal="false"
      aria-labelledby="agent-title"
      className="agent-panel fixed bottom-[116px] left-1/2 z-20 w-[min(440px,calc(100vw-28px))] -translate-x-1/2"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.985 }}
      transition={reduceMotion ? { duration: 0 } : transition}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className={`agent-avatar agent-${agent.color}`}><Icon size={20} /></span>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="agent-title" className="text-[15px] font-semibold tracking-tight">{agent.name}</h2>
              <span className="role-pill">{agent.role}</span>
            </div>
            <p className="mt-1 text-xs text-white/45">{agent.description}</p>
          </div>
        </div>
        <button type="button" className="panel-close" aria-label="Fechar painel" onClick={onClose}><X size={16} /></button>
      </div>

      {runState === "idle" ? (
        <div className="mt-5">
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">Comece com uma ideia</p>
          <div className="flex flex-wrap gap-2">
            {agent.prompts.map((prompt) => (
              <button key={prompt} type="button" className="prompt-chip" onClick={() => onPrompt(prompt)}>
                <FileText size={12} /> {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={`run-card mt-5 ${runState === "completed" ? "run-complete" : ""}`} aria-live="polite">
          <div className="flex items-center gap-2">
            {runState === "running" ? (
              <LoaderCircle size={15} className="animate-spin text-violet-300" />
            ) : (
              <span className="completion-mark"><Check size={12} /></span>
            )}
            <span className="text-xs font-medium text-white/80">
              {runState === "running" ? "Organizando sua ideia..." : "Tarefa concluída"}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/45">{submittedTask}</p>
          {runState === "completed" && (
            <p className="mt-3 border-t border-white/[0.07] pt-3 text-xs leading-5 text-white/60">{agent.result}</p>
          )}
        </div>
      )}

      <form className="task-form mt-4" onSubmit={onSubmit}>
        <label htmlFor="agent-task" className="sr-only">Descreva uma tarefa para {agent.name}</label>
        <textarea
          id="agent-task"
          ref={inputRef}
          value={task}
          onChange={(event) => onTaskChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={`Peça algo ao ${agent.name}...`}
          rows={2}
          maxLength={500}
        />
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-[10px] text-white/25">Enter para enviar · Shift + Enter para nova linha</span>
          <button type="submit" className="send-button" disabled={!task.trim() || runState === "running"} aria-label="Executar tarefa">
            <ArrowUp size={15} />
          </button>
        </div>
      </form>
      <p className="mt-3 text-center text-[10px] text-white/25">
        <Sparkles size={11} className="mr-1 inline-block align-[-2px]" />
        Demonstração local · sem serviços externos
      </p>
    </motion.section>
  );
}

export default App;
