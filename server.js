import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// 🔐 TOKEN CERTO
const MP_TOKEN = process.env.MP_TOKEN;

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

    // 🔍 DEBUG (pode ver no Render)
    console.log("PIX GERADO:", data.id);

    res.json({
      id: data.id,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (err) {
    console.log("ERRO PIX:", err);
    res.status(500).json({ error: "Erro ao gerar PIX" });
  }
});

// ================= WEBHOOK =================
app.post("/webhook", async (req, res) => {
  console.log("WEBHOOK RECEBIDO:", req.body);
  res.sendStatus(200);
});

// ================= STATUS (CONSULTA DIRETA MP) =================
app.get("/status/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log("CONSULTANDO STATUS:", id);

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        "Authorization": `Bearer ${MP_TOKEN}`
      }
    });

    const data = await response.json();

    console.log("STATUS MP:", data.status);

    res.json({
      status: data.status || "pending"
    });

  } catch (err) {
    console.log("ERRO STATUS:", err);
    res.json({ status: "pending" });
  }
});

// ================= START =================
app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
