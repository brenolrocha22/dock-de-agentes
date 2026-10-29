export type DockSettings = {
  // Nome do monitor informado pelo sistema; null usa o monitor principal.
  monitorId: string | null;
  agentsEnabled: boolean;
};

const storageKey = "dock.settings";

export const defaultSettings: DockSettings = { monitorId: null, agentsEnabled: true };

export function parseSettings(value: unknown): DockSettings {
  if (typeof value !== "object" || value === null) return defaultSettings;
  const { monitorId, agentsEnabled } = value as Record<string, unknown>;
  return {
    monitorId: typeof monitorId === "string" ? monitorId : null,
    agentsEnabled: typeof agentsEnabled === "boolean" ? agentsEnabled : true,
  };
}

export function loadSettings(): DockSettings {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? parseSettings(JSON.parse(raw)) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: DockSettings): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Sem armazenamento disponível, a escolha vale só para esta sessão.
  }
}
