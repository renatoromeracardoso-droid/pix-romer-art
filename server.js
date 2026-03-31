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

// 🧠 memória temporária
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
      payer: {
        email: email || "cliente@email.com"
      }
    });

    const dados = payment.body || payment;

    console.log("PIX GERADO:", JSON.stringify(dados, null, 2));

    // 🔥 pega QR de qualquer formato
    let qr = null;
    let qrBase64 = null;

    // padrão principal
    if (dados.point_of_interaction?.transaction_data) {
      qr = dados.point_of_interaction.transaction_data.qr_code;
      qrBase64 = dados.point_of_interaction.transaction_data.qr_code_base64;
    }

    // fallback 1
    if (!qr && dados.qr_code) {
      qr = dados.qr_code;
      qrBase64 = dados.qr_code_base64;
    }

    // fallback 2 (casos raros)
    if (!qr && dados.transaction_details?.external_resource_url) {
      qr = dados.transaction_details.external_resource_url;
    }

    // 🚨 validação final
    if (!qr) {
      console.log("❌ QR NÃO ENCONTRADO");
      return res.status(500).json({
        error: "QR não retornado pelo Mercado Pago",
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
