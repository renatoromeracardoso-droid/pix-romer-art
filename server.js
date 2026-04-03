import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";
import fs from "fs";

const app = express();
app.use(express.json());

// 🔥 FIREBASE VIA SECRET FILE
const serviceAccount = JSON.parse(
  fs.readFileSync("/etc/secrets/firebase.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🔑 TOKEN MERCADO PAGO
const MP_TOKEN = process.env.MP_TOKEN;

// 🚀 CRIAR PIX
app.post("/pix", async (req, res) => {
  try {
    const { valor, pedidoId } = req.body;

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        payment_method_id: "pix",
        description: `Pedido ${pedidoId}`,
        notification_url: "https://pix-romer-art.onrender.com/webhook",
        payer: {
          email: "cliente@email.com"
        }
      })
    });

    const data = await response.json();

    res.json({
      qr: data.point_of_interaction.transaction_data.qr_code_base64,
      copia: data.point_of_interaction.transaction_data.qr_code
    });

  } catch (e) {
    console.log("Erro PIX:", e);
    res.status(500).json({ erro: e.message });
  }
});


// 🚨 WEBHOOK (ATUALIZA FIREBASE)
app.post("/webhook", async (req, res) => {
  try {
    const paymentId = req.query["data.id"];

    if (!paymentId) return res.sendStatus(200);

    const pagamento = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`
        }
      }
    );

    const data = await pagamento.json();

    const status = data.status;
    const descricao = data.description;

    console.log("WEBHOOK:", descricao, status);

    const pedidoId = descricao.replace("Pedido ", "");

    // 🔥 ATUALIZA STATUS NO FIREBASE
    await db.collection("pedidos").doc(pedidoId).set({
      status: status === "approved" ? "approved" : "pending",
      atualizadoEm: new Date()
    }, { merge: true });

    res.sendStatus(200);

  } catch (e) {
    console.log("Erro webhook:", e);
    res.sendStatus(500);
  }
});


// 🚀 TESTE (OPCIONAL)
app.get("/", (req, res) => {
  res.send("Servidor rodando 🚀");
});


app.listen(10000, () => console.log("Servidor rodando 🚀"));
