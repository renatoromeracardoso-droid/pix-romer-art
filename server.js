const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 Token vindo do Render (Environment Variable)
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN
});

// ==============================
// 🔥 ROTA GERAR PIX
// ==============================
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
        email: email || "cliente@email.com"
      }
    });

    res.json({
      id: payment.body.id,
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (error) {
    console.log("❌ ERRO PIX:", error.message);
    res.status(500).json({ error: "Erro ao gerar PIX" });
  }
});

// ==============================
// 🔥 WEBHOOK (CONFIRMA PAGAMENTO)
// ==============================
app.post("/webhook", async (req, res) => {
  try {

    console.log("📩 Webhook bruto:", JSON.stringify(req.body));

    const body = req.body;

    // 🔥 pega ID de qualquer formato
    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split("/").pop();

    if (!paymentId) {
      console.log("⚠️ ID não encontrado");
      return res.sendStatus(200);
    }

    console.log("🔎 Buscando pagamento:", paymentId);

    const payment = await mercadopago.payment.findById(paymentId);

    const status = payment.body.status;

    console.log("💰 STATUS REAL:", status);

    if (status === "approved") {
      console.log("✅ PAGAMENTO APROVADO!");
    }

    res.sendStatus(200);

  } catch (error) {
    console.log("❌ ERRO WEBHOOK:", error.message);
    res.sendStatus(500);
  }
});

      // 🔥 FUTURO:
      // aqui você pode salvar pedido, enviar WhatsApp, etc
    }

    res.sendStatus(200);

  } catch (error) {
    console.log("❌ ERRO WEBHOOK:", error.message);
    res.sendStatus(500);
  }
});

// ==============================
// 🔥 TESTE RÁPIDO (OPCIONAL)
// ==============================
app.get("/", (req, res) => {
  res.send("Servidor PIX rodando 🚀");
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});
