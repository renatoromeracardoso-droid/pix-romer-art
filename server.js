const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 TOKEN do Render
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// 🧠 banco temporário
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

    // ✅ PADRÃO QUE FUNCIONAVA
    const dados = payment.body;

    // 🔍 DEBUG (pode ver no Render Logs)
    console.log("PIX GERADO:", JSON.stringify(dados, null, 2));

    // 🔥 pega QR corretamente
    const qr = dados.point_of_interaction?.transaction_data?.qr_code;
    const qrBase64 = dados.point_of_interaction?.transaction_data?.qr_code_base64;

    // 🚨 validação
    if (!qr || !qrBase64) {
      console.log("❌ QR NÃO VEIO");
      return res.status(500).json({
        error: "QR não retornado pelo Mercado Pago"
      });
    }

    // 💾 salva status
    pagamentos[dados.id] = "pending";

    // ✅ resposta correta
    res.json({
      id: dados.id,
      qr_code: qr,
      qr_code_base64: qrBase64
    });

  } catch (error) {
    console.log("❌ ERRO PIX:", error);
    res.status(500).json({
      error: "Erro ao gerar PIX"
    });
  }
});

// 🔄 WEBHOOK (opcional, mas já pronto)
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

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
