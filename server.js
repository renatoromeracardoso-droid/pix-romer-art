const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// 👇 SERVIR ARQUIVOS HTML (IMPORTANTE)
app.use(express.static(path.join(__dirname, "public")));

// TESTE
app.get("/", (req, res) => {
  res.send("Servidor OK 🚀");
});

// PIX (simulado por enquanto)
app.post("/pix", (req, res) => {
  const { valor } = req.body;

  if (!valor) {
    return res.status(400).json({ erro: "valor obrigatório" });
  }

  res.json({
    qr: "PIX-CODE-EXEMPLO",
    img: "" // depois colocamos real
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
