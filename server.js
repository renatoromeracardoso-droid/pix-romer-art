const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

// 🔥 LIBERA ACESSO (resolve seu erro)
app.use(cors());

// permite JSON
app.use(express.json());

// 🔥 SUA URL DO GOOGLE SHEETS
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwICcMeCnz_yMzgVWAujLPkkPsceLrOU1cICawcHUhbFj95wD6CUATq9Q14OvhXmsuH/exec";

// rota teste
app.get("/", (req, res) => {
  res.send("API OK 🚀");
});

// rota salvar
app.post("/salvar", async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();

    res.json({
      status: "ok",
      resposta: text
    });

  } catch (error) {
    res.status(500).json({
      status: "erro",
      mensagem: error.message
    });
  }
});

// porta padrão render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
