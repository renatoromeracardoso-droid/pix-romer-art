const express = require("express");
const mercadopago = require("mercadopago");

const app = express();

app.use(express.json());

// 🔥 CORS LIBERADO
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

// 🔐 TOKEN
mercadopago.configurations.setAccessToken(process.env.MP_TOKEN);

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

// ================= STATUS DIRETO (🔥 CORRETO) =================
app.get("/status/:id", async (req, res) => {
  try {

    const pagamento = await mercadopago.payment.get(req.params.id);

    console.log("STATUS MP:", pagamento.body.status);

    res.json({
      status: pagamento.body.status
    });

  } catch (erro) {
    console.log("ERRO STATUS:", erro);
    res.status(500).json({ status: "erro" });
  }
});

// ================= TESTE =================
app.get("/", (req, res) => {
  res.send("Servidor PIX rodando 🚀");
});

// ================= START =================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
