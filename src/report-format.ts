export type ReportInput = {
  agentName: string;
  agentRole: string;
  task: string;
  result: string;
  createdAt: Date;
};

const pad = (value: number) => String(value).padStart(2, "0");

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/, "");
}

// Data primeiro, para que a pasta fique em ordem cronológica no Explorer.
export function reportFileName(createdAt: Date, task: string): string {
  const date = `${createdAt.getFullYear()}-${pad(createdAt.getMonth() + 1)}-${pad(createdAt.getDate())}`;
  const time = `${pad(createdAt.getHours())}${pad(createdAt.getMinutes())}${pad(createdAt.getSeconds())}`;
  return `${date}_${time}_${slugify(task) || "relatorio"}.md`;
}

export function reportMarkdown({ agentName, agentRole, task, result, createdAt }: ReportInput): string {
  const date = `${pad(createdAt.getDate())}/${pad(createdAt.getMonth() + 1)}/${createdAt.getFullYear()}`;
  const time = `${pad(createdAt.getHours())}:${pad(createdAt.getMinutes())}`;
  return [
    `# ${agentName} — ${task}`,
    "",
    `- Data: ${date} ${time}`,
    `- Agente: ${agentName} (${agentRole})`,
    "",
    "## Pedido",
    "",
    task,
    "",
    "## Resultado",
    "",
    result,
    "",
    "---",
    "",
    "Apoio à decisão. Não é recomendação de investimento.",
    "",
  ].join("\n");
}
