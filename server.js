const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

// 🔥 MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // SERVE SEU SITE

// 🔥 TOKEN MERCADO PAGO
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// 🔥 TESTE
app.get("/api", (req, res) => {
  res.json({ status: "Servidor OK 🚀" });
});

// 🔥 GERAR PIX
app.post("/pix", async (req, res) => {

  try {

    console.log("📥 BODY:", req.body);

    const { valor, email } = req.body;

    // 🔒 VALIDAÇÃO
    if (!valor || valor <= 0) {
      return res.status(400).json({
        erro: "Valor inválido"
      });
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: email || "comprador@teste.com"
      }
    });

    console.log("✅ PIX criado");

    const dados = pagamento.body.point_of_interaction.transaction_data;

    return res.json({
      qr: dados.qr_code,
      img: dados.qr_code_base64
    });

  } catch (erro) {

    console.log("❌ ERRO:", erro);

    return res.status(500).json({
      erro: "Erro ao gerar PIX",
      detalhe: erro.message
    });
  }
});

// 🔥 PORTA (OBRIGATÓRIO PRO RENDER)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});
