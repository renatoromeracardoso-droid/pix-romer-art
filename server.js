const express = require("express");
const cors = require("cors");
const path = require("path");
const mercadopago = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔑 TOKEN MERCADO PAGO
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// TESTE
app.get("/", (req,res)=>{
  res.send("Servidor OK 🚀");
});

// PIX REAL
app.post("/pix", async (req,res)=>{

  try{

    const { valor } = req.body;

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: "cliente@email.com"
      }
    });

    const pix = pagamento.body.point_of_interaction.transaction_data;

    res.json({
      qr: pix.qr_code,
      img: pix.qr_code_base64
    });

  }catch(e){
    console.log(e);
    res.status(500).json({erro:"Erro ao gerar PIX"});
  }

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, ()=>{
  console.log("Servidor rodando 🚀");
});
