const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN
});

// 🔥 GERAR PIX
app.post("/pix", async (req, res) => {
  try {
    const { valor, email } = req.body;

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido Romer Art",
      payment_method_id: "pix",
      payer: {
        email: email || "teste@test.com"
      }
    });

    res.json({
      id: payment.body.id,
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro PIX" });
  }
});

// 🔥 WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    if (data.type === "payment") {

      const payment = await mercadopago.payment.findById(data.data.id);

      console.log("STATUS:", payment.body.status);

      if (payment.body.status === "approved") {
        console.log("✅ PAGAMENTO APROVADO!");
        // aqui você pode salvar pedido depois
      }
    }

    res.sendStatus(200);

  } catch (err) {
    console.log("Erro webhook", err);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando");
});
