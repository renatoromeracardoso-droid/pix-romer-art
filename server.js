const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// 🔑 TOKEN MERCADO PAGO
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// 🧠 MEMÓRIA SIMPLES
let pagamentos = {};

// 🚀 GERAR PIX
app.post("/pix", async (req, res) => {
  try {

    const { valor, email } = req.body;

    if (!valor || valor <= 0) {
      return res.status(400).json({ erro: "Valor inválido" });
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: email || "teste@email.com"
      }
    });

    const id = pagamento.body.id;

    // salva status
    pagamentos[id] = "pending";

    console.log("PIX criado:", id);

    res.json({
      id: id,
      qr: pagamento.body.point_of_interaction.transaction_data.qr_code,
      img: pagamento.body.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (e) {
    console.log("ERRO PIX:", e.message);
    res.status(500).json({ erro: "Erro ao gerar PIX" });
  }
});

// 🔄 STATUS
app.get("/status/:id", async (req, res) => {

  const id = req.params.id;

  try {

    const pagamento = await mercadopago.payment.get(id);

    const status = pagamento.body.status;

    console.log("Status MP:", status);

    if (status === "approved") {
      pagamentos[id] = "pago";
    }

    res.json({ status: pagamentos[id] || "pending" });

  } catch (e) {
    console.log("Erro status:", e.message);
    res.json({ status: "pending" });
  }
});

// 🚀 SERVER
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
