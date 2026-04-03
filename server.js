import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ✅ AJUSTE AQUI
const MP_TOKEN = process.env.MP_TOKEN;

// 🔥 MEMÓRIA DE STATUS
let pagamentos = {};

// ================= PIX =================
app.post("/pix", async (req, res) => {

  try {

    const { valor, email } = req.body;

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MP_TOKEN}`
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: "Pedido RomerArt",
        payment_method_id: "pix",
        payer: {
          email: email || "teste@teste.com"
        }
      })
    });

    const data = await response.json();

    // 🔥 SALVA COMO PENDING
    pagamentos[data.id] = "pending";

    res.json({
      id: data.id,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro ao gerar PIX" });
  }

});

// ================= WEBHOOK =================
app.post("/webhook", async (req, res) => {

  try {

    const body = req.body;

    console.log("WEBHOOK RECEBIDO:", body);

    if (body.type === "payment") {

      const paymentId = body.data.id;

      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${MP_TOKEN}`
        }
      });

      const data = await response.json();

      console.log("STATUS MP:", data.status);

      // 🔥 SALVA STATUS CORRETO
      pagamentos[paymentId] = data.status;

    }

    res.sendStatus(200);

  } catch (err) {
    console.log("Erro webhook:", err);
    res.sendStatus(500);
  }

});

// ================= STATUS =================
app.get("/status/:id", (req, res) => {

  const id = req.params.id;

  const status = pagamentos[id] || "pending";

  res.json({ status });

});

// ================= START =================
app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
