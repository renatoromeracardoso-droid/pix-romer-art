const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const SHEET_ID = "COLE_SEU_ID_AQUI";
const ABA = "Notas";

app.get("/pedidos", async (req, res) => {
  try {
    const url = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(ABA)}`;

    console.log("Buscando:", url);

    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    console.error("ERRO REAL:", error.message);

    res.status(500).json({
      erro: "Erro ao buscar dados",
      detalhe: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Rodando na porta " + PORT);
});
