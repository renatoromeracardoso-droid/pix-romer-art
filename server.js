const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

// 🔐 senha simples admin
const ADMIN_PASSWORD = "123456";

// rota para salvar no sheets
app.post("/salvar", async (req, res) => {
  const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=921668890&single=true&output=csv", {
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
