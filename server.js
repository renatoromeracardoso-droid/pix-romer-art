const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 👉 COLE SEU ID AQUI (CONFIRMADO)
const SHEET_ID = "1rc7bmVFGwuSjrHTTYNxOdAWx9DPp5CdQetycT4EaGkM";

// 👉 FORÇA PRIMEIRA ABA (SEM ERRO DE NOME)
const ABA = "0";

app.get("/pedidos", async (req, res) => {
  try {
    const url = https://opensheet.elk.sh/${SHEET_ID}/${ABA};

    console.log("Buscando:", url);

    const response = await axios.get(url);

    res.json(response.data);

  } catch (error) {
    console.error("ERRO:", error.message);

    res.status(500).json({
      erro: "Erro ao buscar dados",
      detalhe: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
