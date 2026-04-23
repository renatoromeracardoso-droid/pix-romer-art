const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ⚠️ COLOCA SEU ID DA PLANILHA AQUI
const SHEET_ID = "1rc7bmVFGwuSjrHTTYNxOdAWx9DPp5CdQetycT4EaGkM";

// ⚠️ NOME EXATO DA ABA
const ABA = "Notas";

app.get("/pedidos", async (req, res) => {
  try {
    const url = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(ABA)}`;

    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: "Erro ao buscar dados" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
