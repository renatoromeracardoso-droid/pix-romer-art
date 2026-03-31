const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 TOKEN
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// banco simples
let pagamentos = {};

// 🚀 GERAR PIX (VERSÃO ESTÁVEL)
app.post("/pix", async (req, res) => {
  try {
    const { valor, email } = req.body;

    if (!valor) {
      return res.status(400).json({ error: "Valor obrigatório" });
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido Romer Art",
      payment_method_id: "pix",
      payer: {
        email: email || "cliente@email.com"
      }
    });

    const body = pagamento.response || pagamento.body;

    // 🔥 LOG PRA DEBUG
    console.log("RETORNO MP:", JSON.stringify(body, null, 2));

    const tx = body.point_of_interaction?.transaction_data;

    if (!tx || !tx.qr_code_base64) {
      return res.status(500).json({
        error: "Mercado Pago não retornou QR"
      });
    }

    pagamentos[body.id] = "pending";

    res.json({
      id: body.id,
      qr_code: tx.qr_code,
      qr_code_base64: tx.qr_code_base64
    });

  } catch (err) {
    console.log("❌ ERRO PIX:", err);
    res.status(500).json({ error: "Erro ao gerar PIX" });
  }
});

// 🔄 STATUS
app.get("/status/:id", (req, res) => {
  res.json({
    status: pagamentos[req.params.id] || "pending"
  });
});

// 🚀 START
app.listen(3000, () => console.log("🔥 Servidor rodando"));
