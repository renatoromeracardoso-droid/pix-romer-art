const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// 🔥 SUA URL DO GOOGLE SCRIPT
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyhPHe-E1kKugmDcoftKfyOp7sIH-5YEoJ6JwmLjMNjEuBLnPkvJRpzBkji77ZgZeS/exec";

// ROTA TESTE
app.get("/", (req, res) => {
  res.send("API OK 🚀");
});

// ROTA SALVAR
app.post("/salvar", async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(req.body),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const text = await response.text();

    res.json({ status: "ok", resposta: text });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.listen(3000, () => console.log("Servidor rodando"));
