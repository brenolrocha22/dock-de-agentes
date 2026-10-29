import { useEffect, useReducer, useRef, useState, type FormEvent, type RefObject } from "react";
import {
  ArrowUp,
  Building2,
  Check,
  ChevronDown,
  Command,
  FileText,
  FolderOpen,
  GripHorizontal,
  GripVertical,
  LoaderCircle,
  LogOut,
  Monitor,
  Plus,
  Power,
  Radar,
  Settings2,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  closeWindow,
  fitWindowToContent,
  isDesktop,
  listMonitors,
  moveWindowToMonitor,
  refitOnScaleChange,
  showWindowOnMonitor,
  startWindowDrag,
  watchDockLayout,
  type MonitorOption,
} from "./desktop-window";
import { reportFileName, reportMarkdown } from "./report-format";
import { listReports, openReport, openReportsFolder, saveReport, type ReportFile } from "./reports";
import { loadSettings, saveSettings, type DockSettings } from "./settings";
import { initialTaskState, taskReducer } from "./task-state";
import type { DockLayout } from "./window-geometry";

type AgentId = "acoes" | "fiis" | "radar" | "carteira";
type RunState = "idle" | "running" | "completed";

type Agent = {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  color: string;
  icon: LucideIcon;
  prompts: string[];
  result: string;
};

// Sem fonte de dados conectada, o resultado simulado diz isso em vez de inventar números.
const simulatedResult =
  "Simulação: nenhuma fonte de dados está conectada, então não há análise para mostrar. Na versão real, a resposta trará os indicadores com fonte e data.";

const agents: Agent[] = [
  {
    id: "acoes",
    name: "Ações",
    role: "Fundamentalista",
    description: "Analisa uma ação pelos indicadores: P/L, P/VP, ROE, dívida e dividendos.",
    color: "violet",
    icon: TrendingUp,
    prompts: ["Analisar uma ação pelo ticker", "Comparar duas ações do mesmo setor"],
    result: simulatedResult,
  },
  {
    id: "fiis",
    name: "FIIs",
    role: "Fundos imobiliários",
    description: "Analisa um FII: dividend yield, P/VP, vacância, tipo e histórico de rendimentos.",
    color: "blue",
    icon: Building2,
    prompts: ["Analisar um FII pelo ticker", "Comparar FIIs de tijolo e de papel"],
    result: simulatedResult,
  },
  {
    id: "radar",
    name: "Radar",
    role: "Oportunidades",
    description: "Filtra ações e FIIs por critérios objetivos, como desconto e dividendos.",
    color: "amber",
    icon: Radar,
    prompts: ["Filtrar ações com P/VP abaixo de 1", "Filtrar FIIs por dividend yield"],
    result: simulatedResult,
  },
  {
    id: "carteira",
    name: "Carteira",
    role: "Revisão",
    description: "Revisa sua carteira: diversificação, concentração e renda mensal.",
    color: "mint",
    icon: Wallet,
    prompts: ["Revisar a diversificação", "Estimar a renda mensal com dividendos"],
    result: simulatedResult,
  },
];

const transition = { type: "spring" as const, stiffness: 420, damping: 34 };

// No app desktop os painéis ficam no fluxo ao lado do dock, e a janela se ajusta a eles.
const panelPlacement = isDesktop
  ? "relative w-[440px]"
  : "fixed bottom-[116px] left-1/2 z-20 w-[min(440px,calc(100vw-28px))] -translate-x-1/2";

function useDesktopWindow(stackRef: RefObject<HTMLDivElement | null>, onLayout: (layout: DockLayout) => void) {
  useEffect(() => {
    const stack = stackRef.current;
    if (!isDesktop || !stack) return;

    const measure = () => ({ width: stack.offsetWidth, height: stack.offsetHeight });
    void showWindowOnMonitor(measure(), loadSettings().monitorId);

    const observer = new ResizeObserver(() => void fitWindowToContent(measure()));
    observer.observe(stack);
    const stopScale = refitOnScaleChange();
    const stopLayout = watchDockLayout(onLayout);

    return () => {
      observer.disconnect();
      void stopScale.then((stop) => stop());
      void stopLayout.then((stop) => stop());
    };
  }, [stackRef, onLayout]);
}

function App() {
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<DockSettings>(loadSettings);
  const [layout, setLayout] = useState<DockLayout>("horizontal");
  const [reportsVersion, setReportsVersion] = useState(0);
  const [savedReport, setSavedReport] = useState<string | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [task, setTask] = useState("");
  const [taskExecution, dispatchTask] = useReducer(taskReducer, initialTaskState);
  const runState = taskExecution.status;
  const submittedTask = taskExecution.task;
  const reducedMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeAgent = agents.find((agent) => agent.id === selectedAgent);
  const vertical = layout !== "horizontal";
  // Na vertical o dock mostra só os ícones, para manter a largura fixa.
  const showLabels = expanded && !vertical;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useDesktopWindow(stackRef, setLayout);

  function updateSettings(next: DockSettings) {
    setSettings(next);
    saveSettings(next);
  }

  function chooseAgent(id: AgentId) {
    if (!settings.agentsEnabled) return;
    setSettingsOpen(false);
    setSelectedAgent((current) => (current === id ? null : id));
    setTask("");
    setSavedReport(null);
    dispatchTask({ type: "reset" });
  }

  function toggleSettings() {
    closePanel();
    setSettingsOpen((open) => !open);
  }

  function toggleAgents() {
    if (settings.agentsEnabled) closePanel();
    updateSettings({ ...settings, agentsEnabled: !settings.agentsEnabled });
  }

  function chooseMonitor(monitorId: string) {
    updateSettings({ ...settings, monitorId });
    void moveWindowToMonitor(monitorId);
  }

  function runTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = task.trim();
    if (!trimmed || !activeAgent || !settings.agentsEnabled) return;

    if (timer.current) clearTimeout(timer.current);
    setSavedReport(null);
    dispatchTask({ type: "start", task: trimmed });
    timer.current = setTimeout(() => {
      dispatchTask({ type: "complete" });
      if (isDesktop) void storeReport(activeAgent, trimmed);
    }, 1350);
  }

  async function storeReport(agent: Agent, request: string) {
    const createdAt = new Date();
    const content = reportMarkdown({
      agentName: agent.name,
      agentRole: agent.role,
      task: request,
      result: agent.result,
      createdAt,
    });
    try {
      const fileName = reportFileName(createdAt, request);
      await saveReport(agent.id, fileName, content);
      setSavedReport(fileName);
      setReportsVersion((version) => version + 1);
    } catch (error) {
      console.error("Falha ao salvar o relatório", error);
    }
  }

  function closePanel() {
    if (timer.current) clearTimeout(timer.current);
    setSelectedAgent(null);
    setTask("");
    setSavedReport(null);
    dispatchTask({ type: "reset" });
  }

  const panels = (
    <AnimatePresence mode={isDesktop ? "wait" : "sync"}>
      {activeAgent && (
        <AgentPanel
          key={activeAgent.id}
          agent={activeAgent}
          task={task}
          runState={runState}
          submittedTask={submittedTask}
          savedReport={savedReport}
          reportsVersion={reportsVersion}
          onTaskChange={setTask}
          onSubmit={runTask}
          onClose={closePanel}
          onPrompt={(prompt) => setTask(prompt)}
          reduceMotion={Boolean(reducedMotion)}
        />
      )}
      {settingsOpen && (
        <SettingsPanel
          key="settings"
          monitorId={settings.monitorId}
          onMonitorChange={chooseMonitor}
          onClose={() => setSettingsOpen(false)}
          reduceMotion={Boolean(reducedMotion)}
        />
      )}
    </AnimatePresence>
  );

  const dock = (
    <div
      className={
        isDesktop
          ? `dock-zone dock-slot ${vertical ? "is-vertical" : ""}`
          : "dock-zone fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(18px,env(safe-area-inset-bottom))] pt-8"
      }
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setExpanded(false);
        }
      }}
    >
      <nav aria-label="Agentes disponíveis" className={`dock-shell ${vertical ? "is-vertical" : ""}`}>
        <div className="dock-row">
          {isDesktop && (
            <button
              type="button"
              className="dock-grip"
              aria-label="Arrastar dock"
              title="Arraste para mover o dock"
              onMouseDown={(event) => {
                if (event.button === 0) startWindowDrag();
              }}
            >
              {vertical ? <GripHorizontal size={16} /> : <GripVertical size={16} />}
            </button>
          )}
          <span className="dock-logo" aria-hidden="true"><Sparkles size={17} /></span>
          <div
            className={`dock-agents ${settings.agentsEnabled ? "" : "is-off"}`}
            onWheel={(event) => {
              // A roda do mouse rola a lista na direção do dock.
              if (!vertical) event.currentTarget.scrollLeft += event.deltaY;
            }}
          >
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
                  title={vertical ? agent.name : undefined}
                  disabled={!settings.agentsEnabled}
                  onClick={() => chooseAgent(agent.id)}
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <AnimatePresence initial={false}>
                    {showLabels && (
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
          </div>
          <span className="dock-divider" />
          <button
            type="button"
            className={`dock-power ${settings.agentsEnabled ? "is-on" : ""}`}
            aria-label={settings.agentsEnabled ? "Desligar agentes" : "Ligar agentes"}
            aria-pressed={settings.agentsEnabled}
            title={settings.agentsEnabled ? "Agentes ligados" : "Agentes desligados"}
            onClick={toggleAgents}
          >
            <Power size={16} />
          </button>
          <button
            type="button"
            className={`dock-settings ${settingsOpen ? "is-open" : ""}`}
            aria-label="Configurações do dock"
            aria-pressed={settingsOpen}
            title="Configurações"
            onClick={toggleSettings}
          >
            <Settings2 size={17} />
          </button>
        </div>
        {!vertical && (
          <motion.div
            aria-hidden="true"
            className="dock-caption"
            animate={{ opacity: expanded ? 1 : 0, height: expanded ? 17 : 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
          >
            {settings.agentsEnabled ? "SEUS CONSULTORES, A UM CLIQUE" : "AGENTES DESLIGADOS"}
            <ChevronDown size={11} className="ml-1 rotate-180" />
          </motion.div>
        )}
      </nav>
    </div>
  );

  if (isDesktop) {
    return (
      <main className="desktop-root text-white">
        <div ref={stackRef} className={`desktop-stack layout-${layout}`}>
          {panels}
          {dock}
        </div>
      </main>
    );
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
          Agentes que pesquisam ações e fundos imobiliários com base em dados.
          Escolha um agente no dock para começar.
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

      {panels}
      {dock}
    </main>
  );
}

type AgentPanelProps = {
  agent: Agent;
  task: string;
  runState: RunState;
  submittedTask: string;
  savedReport: string | null;
  reportsVersion: number;
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
  savedReport,
  reportsVersion,
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
      className={`agent-panel ${panelPlacement}`}
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
              {runState === "running" ? "Analisando..." : "Análise concluída"}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/45">{submittedTask}</p>
          {runState === "completed" && (
            <p className="mt-3 border-t border-white/[0.07] pt-3 text-xs leading-5 text-white/60">{agent.result}</p>
          )}
          {savedReport && (
            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40">
              <FileText size={11} /> Relatório salvo na pasta {agent.id}
            </p>
          )}
        </div>
      )}

      {isDesktop && <RecentReports agentId={agent.id} version={reportsVersion} highlight={savedReport} />}

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
        Simulação local · não é recomendação de investimento
      </p>
    </motion.section>
  );
}

type RecentReportsProps = {
  agentId: AgentId;
  version: number;
  highlight: string | null;
};

function RecentReports({ agentId, version, highlight }: RecentReportsProps) {
  const [reports, setReports] = useState<ReportFile[] | null>(null);

  useEffect(() => {
    let active = true;
    listReports(agentId)
      .then((files) => active && setReports(files.slice(0, 3)))
      .catch((error: unknown) => console.error("Falha ao listar relatórios", error));
    return () => {
      active = false;
    };
  }, [agentId, version]);

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">Relatórios recentes</p>
        <button type="button" className="link-button" onClick={() => void openReportsFolder(agentId)}>
          <FolderOpen size={12} /> Abrir pasta
        </button>
      </div>
      {reports && reports.length === 0 && <p className="text-xs text-white/35">Nenhum relatório salvo ainda.</p>}
      {reports && reports.length > 0 && (
        <ul className="grid gap-1">
          {reports.map((report) => (
            <li key={report.name}>
              <button
                type="button"
                className={`report-item ${report.name === highlight ? "is-new" : ""}`}
                title="Abrir relatório"
                onClick={() => void openReport(agentId, report.name)}
              >
                <FileText size={12} />
                <span className="truncate">{report.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type SettingsPanelProps = {
  monitorId: string | null;
  onMonitorChange: (monitorId: string) => void;
  onClose: () => void;
  reduceMotion: boolean;
};

function SettingsPanel({ monitorId, onMonitorChange, onClose, reduceMotion }: SettingsPanelProps) {
  const [monitors, setMonitors] = useState<MonitorOption[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isDesktop) return;
    let active = true;
    listMonitors()
      .then((options) => active && setMonitors(options))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  // Sem escolha salva (ou com um monitor desconectado), vale o principal.
  const selected =
    monitors?.find((monitor) => monitor.id === monitorId)?.id ??
    monitors?.find((monitor) => monitor.primary)?.id;

  return (
    <motion.section
      role="dialog"
      aria-modal="false"
      aria-labelledby="settings-title"
      className={`agent-panel ${panelPlacement}`}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.985 }}
      transition={reduceMotion ? { duration: 0 } : transition}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="agent-avatar settings-avatar"><Settings2 size={20} /></span>
          <div>
            <h2 id="settings-title" className="text-[15px] font-semibold tracking-tight">Configurações</h2>
            <p className="mt-1 text-xs text-white/45">Arraste o dock pelos pontinhos para movê-lo.</p>
          </div>
        </div>
        <button type="button" className="panel-close" aria-label="Fechar configurações" onClick={onClose}><X size={16} /></button>
      </div>

      <p className="mb-2.5 mt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">Monitor inicial</p>
      {!isDesktop ? (
        <p className="text-xs leading-5 text-white/45">Disponível apenas no aplicativo desktop.</p>
      ) : failed ? (
        <p className="text-xs leading-5 text-white/45">Não foi possível listar os monitores.</p>
      ) : !monitors ? (
        <p className="flex items-center gap-2 text-xs text-white/45">
          <LoaderCircle size={13} className="animate-spin" /> Procurando monitores...
        </p>
      ) : (
        <div role="radiogroup" aria-label="Monitor inicial" className="grid gap-2">
          {monitors.map((monitor) => {
            const checked = monitor.id === selected;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={checked}
                key={monitor.id}
                className={`monitor-option ${checked ? "is-selected" : ""}`}
                onClick={() => onMonitorChange(monitor.id)}
              >
                <Monitor size={15} />
                <span className="flex-1 text-left">{monitor.label}</span>
                {monitor.primary && <span className="role-pill">Principal</span>}
                {checked && <span className="completion-mark"><Check size={12} /></span>}
              </button>
            );
          })}
        </div>
      )}

      {isDesktop && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" className="quit-button" onClick={() => void openReportsFolder()}>
            <FolderOpen size={13} /> Pasta de relatórios
          </button>
          <button type="button" className="quit-button is-danger" onClick={closeWindow}>
            <LogOut size={13} /> Fechar dock
          </button>
        </div>
      )}
    </motion.section>
  );
}

export default App;
