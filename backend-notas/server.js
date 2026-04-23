const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const SHEET_ID = "1rc7bmVfGwuSjrHTTYNx0dAWx9DPp5CdQetycT4EaGkM";

app.get('/pedidos', async (req, res) => {
  try {
    const url = `https://opensheet.elk.sh/${SHEET_ID}/Notas`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

app.listen(PORT, () => {
  console.log("Servidor rodando");
});
