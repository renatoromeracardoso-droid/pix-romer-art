const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 SUA ACCESS TOKEN (cole a sua aqui)
mercadopago.configure({
  access_token: "APP_USR-3621281958570060-033019-27346be25e4fc9ebc600fbcae12453e3-189230820"
});

app.post("/pix", async (req, res) => {
  try {
    const { valor } = req.body;

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido Romer Art",
      payment_method_id: "pix",
      payer: {
        email: "cliente@email.com"
      }
    });

    res.json({
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64:
        payment.body.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar PIX" });
  }
});

app.get("/", (req, res) => {
  res.send("API PIX funcionando 🚀");
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});
