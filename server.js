const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 GOOGLE SCRIPT (SALVAR NA PLANILHA)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYCFCuKJnEHFNXLsCbAZMR6KR6_2J01aMaZGbpvFi4V2aiTSdT7qJ5LEbN074P5dLz_Q/exec";

// 🔥 SUA PLANILHA (PARAMETROS)
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRfcG76Kqk9MpcvUwfnNfngHBt8T2P-FXUVLckUFj-7HKpMHaavt849j-LFO0WwJYTEioWRz8I9UfOi/pub?gid=1904121177&single=true&output=csv";

// 🔥 CONVERTER CSV PARA JSON
function parseCSV(text) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const values = line.split(",");
    let obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.trim();
    });
    return obj;
  });
}

// 🔥 BUSCAR PARAMETRO NA PLANILHA
async function buscarParametro(material, servico, espessura) {
  const response = await fetch(CSV_URL);
  const text = await response.text();

  const dados = parseCSV(text);

  return dados.find(p =>
    p.Material === material &&
    p.Servico === servico &&
    Number(p.Espessura) === Number(espessura)
  );
}

// 🔥 ROTA PRINCIPAL
app.post("/salvar", async (req, res) => {
  try {
    const { cliente, material, servico, espessura } = req.body;

    const p = await buscarParametro(material, servico, espessura);

    if (!p) {
      return res.json({ erro: "Parâmetro não encontrado na planilha" });
    }

    const tempo = Number(p.TempoBase);
    const valor = Number(p.ValorMinuto);
    const preco = tempo * valor;

    const payload = {
      cliente,
      material,
      espessura,
      tempo,
      preco
    };

    // 🔥 SALVAR NA PLANILHA
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    // 🔥 RESPOSTA PRO SITE
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

// 🔥 TESTE
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.listen(10000, () => console.log("Servidor rodando 🚀"));
