const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 SUA PLANILHA
const SHEET_ID = "1rc7bmVFGwuSjrHTTYNxOdAWx9DPp5CdQetycT4EaGkM";

// 🔥 ROTA PEDIDOS
app.get('/pedidos', async (req, res) => {
  try {
    const url = `https://opensheet.elk.sh/${SHEET_ID}/Notas`;
    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

// 🔥 ROTA EMITIR NOTA
app.post('/emitir/:id', (req, res) => {
  const id = req.params.id;

  console.log("Emitindo nota para:", id);

  res.json({ sucesso: true });
});

// 🔥 SERVIR FRONTEND
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 🔥 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando"));
