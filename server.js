const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

mercadopago.configurations.setAccessToken(process.env.MP_TOKEN);

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
      payer: { email: email || "teste@email.com" }
    });

    res.json({
      id: pagamento.body.id,
      qr_code: pagamento.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: pagamento.body.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (e) {
    console.log("ERRO PIX:", e);
    res.status(500).json({ erro: "Erro PIX" });
  }
});

app.get("/status/:id", async (req, res) => {
  try {
    const pagamento = await mercadopago.payment.get(req.params.id);
    res.json({ status: pagamento.body.status });
  } catch {
    res.status(500).json({ erro: "Erro status" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log("Servidor rodando 🚀"));
