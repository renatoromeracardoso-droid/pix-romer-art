const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

app.use(express.json());
app.use(cors());

// 🔐 Usa o token do Render (Environment Variable)
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN
});

// Rota PIX
app.post("/pix", async (req, res) => {
  try {
    const { valor, email } = req.body;

    if (!valor) {
      return res.status(400).json({ error: "Valor não informado" });
    }

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido Romer Art",
      payment_method_id: "pix",
      payer: {
        email: email || "seuemail@gmail.com"
      }
    });

    res.json({
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (error) {
    console.error("ERRO PIX:", error.response?.data || error.message);

    res.status(500).json({
      error: "Erro ao gerar PIX",
      detalhe: error.response?.data || error.message
    });
  }
});
// Porta padrão Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
