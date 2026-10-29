// Atualiza data/acoes.json com dados reais da brapi.dev (retorno dos últimos 2 anos).
// Sem token, a brapi libera apenas PETR4, VALE3, ITUB4 e MGLU3.
// Com token gratuito: $env:BRAPI_TOKEN="..."; npm.cmd run acoes
import { mkdir, writeFile } from "node:fs/promises";

const token = process.env.BRAPI_TOKEN;
const freeTickers = ["PETR4", "VALE3", "ITUB4", "MGLU3"];
// Universo de exemplo para quem tem token; a escolha não implica desempenho.
const tokenTickers = [...freeTickers, "BBAS3", "ITSA4", "WEGE3", "TAEE11", "EGIE3", "BBSE3", "SAPR11", "CMIG4"];
const tickers = token ? tokenTickers : freeTickers;

async function fetchQuote(ticker) {
  const url = new URL(`https://brapi.dev/api/quote/${ticker}`);
  url.searchParams.set("range", "2y");
  url.searchParams.set("interval", "1mo");
  if (token) url.searchParams.set("token", token);
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok || body.error) throw new Error(`${ticker}: ${body.message ?? response.status}`);
  return body.results[0];
}

function toEntry(quote) {
  const history = (quote.historicalDataPrice ?? []).filter((point) => point.adjustedClose != null);
  if (history.length < 2) return null;
  const first = history[0];
  const last = history[history.length - 1];
  const day = (seconds) => new Date(seconds * 1000).toISOString().slice(0, 10);
  return {
    ticker: quote.symbol,
    nome: quote.longName ?? quote.shortName,
    preco: quote.regularMarketPrice,
    precoEm: quote.regularMarketTime,
    pl: quote.priceEarnings ?? null,
    // Fechamento ajustado considera proventos e desdobramentos.
    retorno2a: Number(((last.adjustedClose / first.adjustedClose - 1) * 100).toFixed(2)),
    inicio: { data: day(first.date), fechamentoAjustado: first.adjustedClose },
    fim: { data: day(last.date), fechamentoAjustado: last.adjustedClose },
  };
}

const acoes = [];
const falhas = [];
for (const ticker of tickers) {
  try {
    const entry = toEntry(await fetchQuote(ticker));
    if (entry) acoes.push(entry);
    else falhas.push(`${ticker}: histórico insuficiente`);
  } catch (error) {
    falhas.push(error.message);
  }
}
acoes.sort((a, b) => b.retorno2a - a.retorno2a);

const criterio = "Retorno total positivo em 2 anos (fechamento ajustado mensal)";
const dataset = {
  fonte: "brapi.dev",
  atualizadoEm: new Date().toISOString(),
  criterio,
  aviso: "Exemplo para estudo. Rentabilidade passada não garante resultado futuro; não é recomendação de investimento.",
  radar: acoes.filter((acao) => acao.retorno2a > 0).map((acao) => acao.ticker),
  acoes,
  falhas,
};

await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(new URL("../data/acoes.json", import.meta.url), `${JSON.stringify(dataset, null, 2)}\n`);
console.log(`${acoes.length} ações salvas; radar: ${dataset.radar.join(", ") || "vazio"}`);
if (falhas.length) console.log(`Falhas: ${falhas.join("; ")}`);
