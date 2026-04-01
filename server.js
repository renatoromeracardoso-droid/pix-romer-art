const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// TOKEN
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// TESTE RAIZ (IMPORTANTE)
app.get("/", (req, res) => {
  res.send("🔥 Servidor PIX ONLINE");
});

// GERAR PIX
app.post("/pix", async (req, res) => {

  console.log("📩 PIX RECEBIDO:", req.body);

  try {

    const { valor, email } = req.body;

    if (!valor) {
      return res.status(400).json({ error: "Valor obrigatório" });
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido Romer Art",
      payment_method_id: "pix",
      payer: {
        email: email || "teste@email.com"
      }
    });

    const dados = pagamento.body;

    const tx = dados.point_of_interaction?.transaction_data;

    if (!tx) {
      return res.status(500).json({
        error: "PIX não retornado",
        debug: dados
      });
    }

    return res.json({
      id: dados.id,
      qr_code: tx.qr_code,
      qr_code_base64: tx.qr_code_base64
    });

  } catch (erro) {

    console.log("❌ ERRO PIX:", erro);

    return res.status(500).json({
      error: erro.message || "Erro ao gerar PIX"
    });
  }
});

// START
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🔥 Servidor rodando na porta", PORT);
});
