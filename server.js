const express = require("express");
const mercadopago = require("mercadopago");

const app = express();

app.use(express.json());

// 🔥 LIBERA CORS (ESSENCIAL)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

// 🔥 RESPONDE PREFLIGHT (CORS)
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// 🔐 TOKEN
mercadopago.configurations.setAccessToken(process.env.MP_TOKEN);

// ================= PIX =================
app.post("/pix", async (req, res) => {
  try {

    let { valor, email } = req.body;

    valor = Number(valor);

    if (!valor || valor <= 0) {
      return res.status(400).json({ erro: "Valor inválido" });
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: valor,
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: email || "teste@email.com"
      }
    });

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

// ================= STATUS =================
app.get("/status/:id", async (req, res) => {
  try {

    const pagamento = await mercadopago.payment.get(req.params.id);

    res.json({
      status: pagamento.body.status
    });

  } catch (erro) {
    console.log("ERRO STATUS:", erro);
    res.status(500).json({ erro: "Erro ao consultar status" });
  }
});

// ================= ROOT TEST =================
app.get("/", (req, res) => {
  res.send("Servidor PIX rodando 🚀");
});

// ================= START =================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
