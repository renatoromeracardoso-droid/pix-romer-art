const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 SUA URL DO APPS SCRIPT
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyzs4Har9IjrgsqLoU_dgUFYb-J21wv4TRAycpMMMmo56Ys_qU3B8CAh1zU92SkuVS_/exec";

// teste
app.get("/", (req, res) => {
  res.send("API OK 🚀");
});

// salvar no sheets
app.post("/salvar", async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();

    console.log("Resposta do Google:", text); // 👈 IMPORTANTE

    res.json({
      status: "ok",
      retorno: text
    });

  } catch (error) {
    console.error("Erro:", error);

    res.status(500).json({
      status: "erro",
      mensagem: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
