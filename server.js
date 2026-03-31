const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 TOKEN
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// 🧠 memória simples
let pagamentos = {};

// ✅ TESTE
app.get("/", (req, res) => {
  res.send("🔥 Servidor OK");
});

// 🚀 GERAR PIX (CORRIGIDO)
app.post("/pix", async (req, res) => {

  console.log("🔥 NOVA REQUISIÇÃO PIX");

  try {
    const { valor, email } = req.body;

    console.log("📦 BODY:", req.body);

    if (!valor) {
      return res.status(400).json({ error: "Valor obrigatório" });
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(parseFloat(valor)),
      description: "Pedido Romer Art",
      payment_method_id: "pix",
      payer: {
        email: email || "test_user@test.com",
        first_name: "Cliente"
      }
    });

    const dados = pagamento.body;

    console.log("✅ RESPOSTA MP:", JSON.stringify(dados, null, 2));

    const tx = dados.point_of_interaction?.transaction_data;

    if (!tx || !tx.qr_code) {
      console.log("❌ PIX SEM QR:", dados);
      return res.status(500).json({
        error: "QR não retornado",
        detalhe: dados
      });
    }

    pagamentos[dados.id] = "pending";

    return res.json({
      id: dados.id,
      qr_code: tx.qr_code,
      qr_code_base64: tx.qr_code_base64
    });

  } catch (e) {

    console.log("❌ ERRO COMPLETO PIX:");
    console.log(e.response?.data || e);

    return res.status(500).json({
      erro_real: e.response?.data || e.message
    });
  }
});

// 🔄 WEBHOOK (não quebra mais nada)
app.post("/webhook", async (req, res) => {
  try {

    console.log("📩 WEBHOOK RECEBIDO:", req.body);

    const data = req.body;

    if (data.type === "payment") {
      const pagamento = await mercadopago.payment.findById(data.data.id);
      const status = pagamento.body.status;

      pagamentos[data.data.id] = status;

      console.log("💰 STATUS:", status);
    }

    res.sendStatus(200);

  } catch (e) {
    console.log("❌ ERRO WEBHOOK:", e);
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
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🔥 Servidor rodando na porta", PORT);
});
