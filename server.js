const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

const client = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MP_TOKEN
});

const payment = new mercadopago.Payment(client);

// GERAR PIX
app.post("/pix", async (req, res) => {
  try {

    let { valor, email } = req.body;

    console.log("VALOR RECEBIDO:", valor);

    valor = Number(valor);

    if (!valor || valor <= 0) {
      return res.status(400).json({ erro: "Valor inválido" });
    }

    const result = await payment.create({
      body: {
        transaction_amount: valor,
        description: "Pedido RomerArt",
        payment_method_id: "pix",
        payer: {
          email: email || "teste@email.com"
        }
      }
    });

    res.json({
      id: result.id,
      qr_code: result.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (e) {
    console.log("ERRO PIX:", e.message);
    res.status(500).json({ erro: "Erro ao gerar PIX" });
  }
});

// STATUS
app.get("/status/:id", async (req, res) => {
  try {

    const result = await payment.get({ id: req.params.id });

    res.json({
      status: result.status
    });

  } catch (e) {
    res.status(500).json({ erro: "Erro status" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
