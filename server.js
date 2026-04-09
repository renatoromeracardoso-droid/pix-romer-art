const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   CONFIGURAÇÕES
========================= */

// 🔥 Apps Script (SALVAR PEDIDOS)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYCFCuKJnEHFNXLsCbAZMR6KR6_2J01aMaZGbpvFi4V2aiTSdT7qJ5LEbN074P5dLz_Q/exec";

// 🔥 PARAMETROS (LightBurn)
const CSV_PARAMETROS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRfcG76Kqk9MpcvUwfnNfngHBt8T2P-FXUVLckUFj-7HKpMHaavt849j-LFO0WwJYTEioWRz8I9UfOi/pub?gid=1904121177&single=true&output=csv";

// 🔥 PEDIDOS (para painel admin)
const CSV_PEDIDOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRfcG76Kqk9MpcvUwfnNfngHBt8T2P-FXUVLckUFj-7HKpMHaavt849j-LFO0WwJYTEioWRz8I9UfOi/pub?gid=0&single=true&output=csv";

/* =========================
   FUNÇÃO CSV → JSON
========================= */

function parseCSV(text) {
  const linhas = text.split("\n").filter(l => l.trim() !== "");
  const headers = linhas[0].split(",");

  return linhas.slice(1).map(l => {
    const valores = l.split(",");
    let obj = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = valores[i]?.trim();
    });

    return obj;
  });
}

/* =========================
   BUSCAR PARAMETROS
========================= */

async function buscarParametro(material, servico, espessura) {
  const res = await fetch(CSV_PARAMETROS);
  const text = await res.text();

  const dados = parseCSV(text);

  return dados.find(p =>
    p.Material === material &&
    p.Servico === servico &&
    Number(p.Espessura) === Number(espessura)
  );
}

/* =========================
   ROTA PRINCIPAL (CALCULAR + SALVAR)
========================= */

app.post("/salvar", async (req, res) => {
  try {
    const { cliente, material, servico, espessura } = req.body;

    const p = await buscarParametro(material, servico, espessura);

    if (!p) {
      return res.json({ erro: "Parâmetro não encontrado na planilha" });
    }

    const tempo = Number(p.TempoBase);
    const preco = tempo * Number(p.ValorMinuto);

    // 🔥 SALVAR NO GOOGLE SHEETS
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cliente,
        material,
        espessura,
        tempo,
        preco
      })
    });

    res.json({
      ok: true,
      potencia: p.Potencia,
      velocidade: p.Velocidade,
      tempo,
      preco
    });

  } catch (err) {
    res.json({ erro: err.message });
  }
});

/* =========================
   PAINEL ADMIN (LISTAR PEDIDOS)
========================= */

app.get("/pedidos", async (req, res) => {
  try {
    const response = await fetch(CSV_PEDIDOS);
    const text = await response.text();

    const dados = parseCSV(text);

    res.json(dados);

  } catch (err) {
    res.json({ erro: err.message });
  }
});

/* =========================
   TESTE
========================= */

app.get("/", (req, res) => {
  res.send("API ROMER ART 🚀");
});

/* =========================
   START
========================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
