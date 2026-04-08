const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

// 🔐 senha simples admin
const ADMIN_PASSWORD = "123456";

// rota para salvar no sheets
app.post("/salvar", async (req, res) => {
  const response = await fetch("SUA_URL_GOOGLE_SCRIPT", {
    method: "POST",
    body: JSON.stringify(req.body)
  });

  res.json({ status: "ok" });
});

// login admin
app.post("/login", (req, res) => {
  const { senha } = req.body;

  if (senha === ADMIN_PASSWORD) {
    res.json({ autorizado: true });
  } else {
    res.json({ autorizado: false });
  }
});

app.listen(3000, () => console.log("Servidor rodando"));
