import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reportFileName, reportMarkdown } from "./report-format.ts";

describe("report format", () => {
  const createdAt = new Date(2026, 9, 28, 18, 32, 5);

  it("names files by date and a readable slug of the request", () => {
    assert.equal(
      reportFileName(createdAt, "Análise de ITSA4: P/VP e dividendos?"),
      "2026-10-28_183205_analise-de-itsa4-p-vp-e-dividendos.md",
    );
  });

  it("falls back to a generic name when the request has no letters or digits", () => {
    assert.equal(reportFileName(createdAt, "???"), "2026-10-28_183205_relatorio.md");
  });

  it("keeps the request, the result and the disclaimer in the report", () => {
    const report = reportMarkdown({
      agentName: "FIIs",
      agentRole: "Fundos imobiliários",
      task: "Analisar um FII pelo ticker",
      result: "Simulação.",
      createdAt,
    });

    assert.match(report, /^# FIIs — Analisar um FII pelo ticker\n/);
    assert.match(report, /- Data: 28\/10\/2026 18:32/);
    assert.match(report, /## Resultado\n\nSimulação\.\n/);
    assert.match(report, /Não é recomendação de investimento\./);
  });
});
