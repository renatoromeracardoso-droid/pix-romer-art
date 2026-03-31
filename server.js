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

// 🧠 memória simples
let pagamentos = {};

// 🚀 GERAR PIX
app.post("/pix", async (req, res) => {
  try {
    const { valor, email } = req.body;

    if (!valor) {
      return res.status(400).json({ error: "Valor obrigatório" });
    }

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido Romer Art",
      payment_method_id: "pix",

      // 🔥 IMPORTANTE (garante fluxo correto)
      notification_url: "https://pix-romer-art.onrender.com/webhook",

      payer: {
        email: email || "cliente@email.com"
      }
    });

    const dados = payment.body || payment;

    console.log("PIX GERADO:", JSON.stringify(dados, null, 2));

    // 🔥 caminho correto do PIX
    const tx = dados.point_of_interaction?.transaction_data;

    const qr = tx?.qr_code;
    const qrBase64 = tx?.qr_code_base64;

    // 🚨 validação forte
    if (!qr || !qrBase64) {
      console.log("❌ QR NÃO VEIO:", dados);
      return res.status(500).json({
        error: "Mercado Pago não retornou QR",
        debug: dados
      });
    }

    pagamentos[dados.id] = "pending";

    return res.json({
      id: dados.id,
      qr_code: qr,
      qr_code_base64: qrBase64
    });

  } catch (error) {
    console.log("❌ ERRO PIX:", error);
    return res.status(500).json({
      error: "Erro ao gerar PIX"
    });
  }
});

// 🔄 WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 WEBHOOK:", data);

    if (data.type === "payment") {
      const pagamento = await mercadopago.payment.findById(data.data.id);
      const dados = pagamento.body || pagamento;

      const status = dados.status;

      pagamentos[data.data.id] = status;

      console.log("💰 STATUS:", status);
    }

    res.sendStatus(200);

  } catch (error) {
    console.log("❌ ERRO WEBHOOK:", error);
    res.sendStatus(500);
  }
});

// 🔎 STATUS
app.get("/status/:id", (req, res) => {
  res.json({
    status: pagamentos[req.params.id] || "pending"
  });
});

// 🚀 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 Servidor rodando na porta", PORT);
});
