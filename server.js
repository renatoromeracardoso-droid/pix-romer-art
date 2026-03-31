const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

// 🔥 CORS LIBERADO (IMPORTANTE)
app.use(cors({ origin: "*" }));
app.use(express.json());

// 🔐 TOKEN (Render ENV: MP_TOKEN)
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// 🧠 memória simples
let pagamentos = {};

// 🔎 TESTE
app.get("/", (req, res) => {
  res.send("🔥 Servidor OK");
});

// 🚀 GERAR PIX
app.post("/pix", async (req, res) => {

  console.log("🔥 REQUISIÇÃO PIX RECEBIDA");

  try {
    const { valor, email } = req.body;

    console.log("📦 Dados:", req.body);

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

    const dados = payment.body;

    console.log("✅ PIX GERADO:", JSON.stringify(dados, null, 2));

    const tx = dados.point_of_interaction?.transaction_data;

    if (!tx || !tx.qr_code) {
      console.log("❌ QR NÃO VEIO:", dados);
      return res.status(500).json({
        error: "QR não retornado pelo Mercado Pago",
        debug: dados
      });
    }

    pagamentos[dados.id] = "pending";

    return res.json({
      id: dados.id,
      qr_code: tx.qr_code,
      qr_code_base64: tx.qr_code_base64
    });

  } catch (error) {
    console.log("❌ ERRO PIX:", error);
    return res.status(500).json({
      error: "Erro ao gerar PIX"
    });
  }
});

// 🔄 WEBHOOK (opcional)
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 WEBHOOK:", data);

    if (data.type === "payment") {
      const pagamento = await mercadopago.payment.findById(data.data.id);
      const status = pagamento.body.status;

      pagamentos[data.data.id] = status;

      console.log("💰 STATUS:", status);
    }

    res.sendStatus(200);

  } catch (error) {
    console.log("❌ ERRO WEBHOOK:", error);
    res.sendStatus(500);
  }
});

// 🔎 CONSULTAR STATUS
app.get("/status/:id", (req, res) => {
  res.json({
    status: pagamentos[req.params.id] || "pending"
  });
});

// 🚀 START
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🔥 Servidor rodando na porta", PORT);
});
