const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 CONFIG TOKEN
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// TESTE
app.get("/", (req, res) => {
  res.send("Servidor OK 🚀");
});

// 🔥 ROTA PIX PROFISSIONAL
app.post("/pix", async (req, res) => {

  try {

    console.log("📥 Requisição recebida:", req.body);

    const { valor, email } = req.body;

    if (!valor || valor <= 0) {
      return res.status(400).json({ erro: "Valor inválido" });
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: email || "teste@teste.com"
      }
    });

    console.log("✅ PIX gerado");

    return res.json({
      qr: pagamento.body.point_of_interaction.transaction_data.qr_code,
      img: pagamento.body.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (erro) {

    console.log("❌ ERRO PIX:", erro);

    return res.status(500).json({
      erro: "Erro ao gerar PIX",
      detalhe: erro.message
    });
  }
});

// PORTA RENDER
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});
