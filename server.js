const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔑 TOKEN
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// 🧠 memória (simples)
let pagamentos = {};

// TESTE
app.get("/", (req, res) => {
  res.send("Servidor OK 🚀");
});

// 🔥 GERAR PIX
app.post("/pix", async (req, res) => {

  try {

    const { valor } = req.body;

    if (!valor) {
      return res.status(400).json({ erro: "Valor obrigatório" });
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: "cliente@email.com"
      }
    });

    const dados = pagamento.body;
    const id = dados.id;

    // salva como pendente
    pagamentos[id] = {
      status: "pendente",
      valor: valor
    };

    const pix = dados.point_of_interaction.transaction_data;

    res.json({
      id: id,
      qr: pix.qr_code,
      img: pix.qr_code_base64
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: "Erro ao gerar PIX" });
  }

});

// 🔥 WEBHOOK (VALIDAÇÃO REAL)
app.post("/webhook", async (req, res) => {

  try {

    const data = req.body;

    if (data.type === "payment") {

      const pagamentoId = data.data.id;

      // 🔍 consulta REAL no Mercado Pago
      const pagamento = await mercadopago.payment.findById(pagamentoId);

      const status = pagamento.body.status;

      console.log("Status MP:", status);

      // ✅ só aprova se for approved
      if (status === "approved") {

        if (pagamentos[pagamentoId]) {
          pagamentos[pagamentoId].status = "pago";
          console.log("Pagamento confirmado:", pagamentoId);
        }

      }

    }

    res.sendStatus(200);

  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }

});

// 🔍 CONSULTAR STATUS (COM VALIDAÇÃO EXTRA)
app.get("/status/:id", async (req, res) => {

  try {

    const id = req.params.id;

    // se não existir localmente
    if (!pagamentos[id]) {
      return res.json({ status: "não encontrado" });
    }

    // 🔍 valida novamente direto no MP (extra segurança)
    const pagamento = await mercadopago.payment.findById(id);

    const statusMP = pagamento.body.status;

    if (statusMP === "approved") {
      pagamentos[id].status = "pago";
    }

    res.json({
      status: pagamentos[id].status
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({ erro: "Erro ao consultar status" });
  }

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});
