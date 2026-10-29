import { isTauri } from "@tauri-apps/api/core";
import {
  PhysicalPosition,
  PhysicalSize,
  availableMonitors,
  currentMonitor,
  getCurrentWindow,
  primaryMonitor,
  type Monitor,
} from "@tauri-apps/api/window";
import {
  anchorFor,
  bottomCenterIn,
  clampToArea,
  layoutForBounds,
  resizeAnchored,
  type DockLayout,
  type Rect,
  type ResizeAnchor,
  type Size,
} from "./window-geometry";

export const isDesktop = isTauri();

export type MonitorOption = {
  id: string;
  label: string;
  primary: boolean;
};

// Distância entre o dock e a barra de tarefas, em pixels lógicos.
const screenMargin = 12;
// Quão perto da lateral (em pixels lógicos) o dock precisa chegar para ficar vertical.
const edgeThreshold = 8;
// Espera o arrasto parar antes de decidir a orientação.
const moveSettleMs = 250;

let lastContentSize: Size | null = null;
let layout: DockLayout = "horizontal";
let nextAnchor: ResizeAnchor | null = null;
let layoutListener: ((layout: DockLayout) => void) | null = null;
let queue: Promise<void> = Promise.resolve();

// As operações de janela são assíncronas; enfileirar evita que um
// redimensionamento leia a posição antiga enquanto outro está em andamento.
function enqueue(task: () => Promise<void>): Promise<void> {
  queue = queue.then(task).catch((error: unknown) => {
    console.error("Falha ao ajustar a janela do dock", error);
  });
  return queue;
}

function setLayout(next: DockLayout) {
  if (next === layout) return;
  // Ao sair da lateral, crescer a partir do centro mantém o dock perto do cursor.
  nextAnchor = next === "horizontal" ? "center" : null;
  layout = next;
  layoutListener?.(next);
}

function monitorId(monitor: Monitor, index: number): string {
  return monitor.name ?? `monitor-${index}`;
}

function workAreaOf(monitor: Monitor): Rect {
  const { position, size } = monitor.workArea;
  return { x: position.x, y: position.y, width: size.width, height: size.height };
}

async function currentBounds(): Promise<Rect> {
  const window = getCurrentWindow();
  const [position, size] = await Promise.all([window.outerPosition(), window.outerSize()]);
  return { x: position.x, y: position.y, width: size.width, height: size.height };
}

async function applyBounds(rect: Rect): Promise<void> {
  const window = getCurrentWindow();
  await window.setSize(new PhysicalSize(rect.width, rect.height));
  await window.setPosition(new PhysicalPosition(rect.x, rect.y));
}

async function fit(content: Size): Promise<void> {
  lastContentSize = content;
  const [scale, bounds, monitor] = await Promise.all([
    getCurrentWindow().scaleFactor(),
    currentBounds(),
    currentMonitor(),
  ]);
  const size = {
    width: Math.ceil(content.width * scale),
    height: Math.ceil(content.height * scale),
  };
  if (size.width === bounds.width && size.height === bounds.height) return;

  const next = resizeAnchored(bounds, size, nextAnchor ?? anchorFor(layout));
  nextAnchor = null;
  await applyBounds(monitor ? clampToArea(next, workAreaOf(monitor)) : next);
}

async function moveTo(id: string | null): Promise<void> {
  const monitors = await availableMonitors();
  const target =
    monitors.find((monitor, index) => monitorId(monitor, index) === id) ??
    (await primaryMonitor()) ??
    monitors[0];
  if (!target) return;

  setLayout("horizontal");
  nextAnchor = null;
  const { width, height } = await getCurrentWindow().outerSize();
  const margin = Math.round(screenMargin * target.scaleFactor);
  const { x, y } = bottomCenterIn(workAreaOf(target), { width, height }, margin);
  await getCurrentWindow().setPosition(new PhysicalPosition(x, y));
  // Monitores com escalas diferentes mudam o tamanho físico do conteúdo.
  if (lastContentSize) await fit(lastContentSize);
}

async function detectLayout(): Promise<void> {
  const [bounds, monitor] = await Promise.all([currentBounds(), currentMonitor()]);
  if (!monitor) return;
  const threshold = Math.round(edgeThreshold * monitor.scaleFactor);
  setLayout(layoutForBounds(bounds, workAreaOf(monitor), threshold));
}

export function fitWindowToContent(content: Size): Promise<void> {
  return enqueue(() => fit(content));
}

export function moveWindowToMonitor(id: string | null): Promise<void> {
  return enqueue(() => moveTo(id));
}

export function showWindowOnMonitor(content: Size, id: string | null): Promise<void> {
  return enqueue(async () => {
    try {
      await fit(content);
      await moveTo(id);
    } finally {
      await getCurrentWindow().show();
    }
  });
}

export function refitOnScaleChange(): Promise<() => void> {
  return getCurrentWindow().onScaleChanged(() => {
    if (lastContentSize) void fitWindowToContent(lastContentSize);
  });
}

export async function watchDockLayout(listener: (layout: DockLayout) => void): Promise<() => void> {
  layoutListener = listener;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stop = await getCurrentWindow().onMoved(() => {
    clearTimeout(timer);
    timer = setTimeout(() => void enqueue(detectLayout), moveSettleMs);
  });
  return () => {
    clearTimeout(timer);
    layoutListener = null;
    stop();
  };
}

export function startWindowDrag(): void {
  void getCurrentWindow().startDragging();
}

export function closeWindow(): void {
  void getCurrentWindow().close();
}

export async function listMonitors(): Promise<MonitorOption[]> {
  const [monitors, primary] = await Promise.all([availableMonitors(), primaryMonitor()]);
  return monitors.map((monitor, index) => ({
    id: monitorId(monitor, index),
    label: `Monitor ${index + 1} · ${monitor.size.width}×${monitor.size.height}`,
    primary: primary !== null && monitor.name === primary.name,
  }));
}
