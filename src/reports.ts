import { invoke } from "@tauri-apps/api/core";

export type ReportFile = {
  name: string;
  modifiedMs: number;
};

// Os relatórios ficam em Documentos\Dock de Agentes\Relatórios\<agente>.
export function saveReport(agent: string, fileName: string, content: string): Promise<string> {
  return invoke<string>("save_report", { agent, fileName, content });
}

export function listReports(agent: string): Promise<ReportFile[]> {
  return invoke<ReportFile[]>("list_reports", { agent });
}

export function openReport(agent: string, fileName: string): Promise<void> {
  return invoke("open_report", { agent, fileName });
}

export function openReportsFolder(agent?: string): Promise<void> {
  return invoke("open_reports_folder", { agent: agent ?? null });
}
