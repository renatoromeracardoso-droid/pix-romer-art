const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

// TOKEN
mercadopago.configurations.setAccessToken(process.env.MP_TOKEN);

// MEMÓRIA
let pagamentos = {};

// ================= PIX =================
app.post("/pix", async (req, res) => {
  try {

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(req.body.valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: req.body.email || "teste@email.com"
      }
    });

    pagamentos[pagamento.body.id] = "pending";

    res.json({
      id: pagamento.body.id,
      qr_code: pagamento.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: pagamento.body.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (erro) {
    console.log("ERRO PIX:", erro);
    res.status(500).json({ erro: "Erro ao gerar PIX" });
  }
});

// ================= WEBHOOK =================
app.post("/webhook", async (req, res) => {

  try {

    if (req.body.type === "payment") {

      const id = req.body.data.id;

      const pagamento = await mercadopago.payment.get(id);

      const status = pagamento.body.status;

      pagamentos[id] = status;

      console.log("WEBHOOK:", id, status);
    }

    res.sendStatus(200);

  } catch (erro) {
    console.log("ERRO WEBHOOK:", erro);
    res.sendStatus(500);
  }

});

// ================= STATUS =================
app.get("/status/:id", (req, res) => {

  const status = pagamentos[req.params.id] || "pending";

  res.json({ status });

});

// TESTE
app.get("/", (req, res) => {
  res.send("Servidor PIX rodando 🚀");
});

// START
app.listen(process.env.PORT || 10000, () => {
  console.log("Servidor rodando 🚀");
});
