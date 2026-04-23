const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔥 SEU ID DA PLANILHA (CONFIRMADO)
const SHEET_ID = "1rc7bmVFGwuSjrHTTYNxOdAWx9DPp5CdQetycT4EaGkM";

// 🔥 USA SEMPRE A PRIMEIRA ABA
const ABA = "0";

// ✅ ROTA PRINCIPAL (CORRIGE "Cannot GET /")
app.use(express.static(__dirname));

// ✅ API
app.get("/pedidos", async (req, res) => {
  try {
    const url = `https://opensheet.elk.sh/${SHEET_ID}/${ABA}`;

    console.log("Buscando:", url);

    const response = await axios.get(url);

    res.json(response.data);

  } catch (error) {
    console.error("ERRO REAL:", error.response?.data || error.message);

    res.status(500).json({
      erro: "Erro ao buscar dados",
      detalhe: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Rodando na porta " + PORT);
});
