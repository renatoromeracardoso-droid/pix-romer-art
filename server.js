import express from "express";
import cors from "cors";
import mercadopago from "mercadopago";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 TOKEN (Render)
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// 🔥 CONFIG MERCADO PAGO (VERSÃO CORRETA)
mercadopago.configure({
  access_token: ACCESS_TOKEN
});

// =======================
// HEALTH CHECK
// =======================
app.get("/", (req, res) => {
  res.send("Servidor rodando 🚀");
});

// =======================
// CALCULO (MANTIDO SIMPLES)
// =======================
app.post("/calcular", (req, res) => {
  try {
    const { largura, altura, quantidade } = req.body;

    const area = (largura * altura) / 100;
    let valor = area * quantidade;

    if (valor < 15) valor = 15;

    res.json({ valor });

  } catch (e) {
    res.json({ erro: "Erro no cálculo" });
  }
});

// =======================
// PIX
// =======================
app.post("/pix", async (req, res) => {
  try {

    if (!ACCESS_TOKEN) {
      return res.json({ erro: "TOKEN não configurado" });
    }

    const { valor, descricao, email } = req.body;

    const payment_data = {
      transaction_amount: Number(valor),
      description: descricao,
      payment_method_id: "pix",
      payer: {
        email: email || "teste@email.com"
      }
    };

    const pagamento = await mercadopago.payment.create(payment_data);

    const qr = pagamento.body.point_of_interaction.transaction_data;

    res.json({
      qr_code: qr.qr_code,
      qr_code_base64: qr.qr_code_base64
    });

  } catch (erro) {
    console.log("ERRO PIX:", erro.message);
    res.json({ erro: "Erro ao gerar PIX" });
  }
});

// =======================
// START
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀 na porta " + PORT);
});
