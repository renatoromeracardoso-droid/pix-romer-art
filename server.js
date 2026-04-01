const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔑 TOKEN MERCADO PAGO
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// 🧠 "Banco" simples (memória)
let pagamentos = {};

// TESTE
app.get("/", (req,res)=>{
  res.send("Servidor OK 🚀");
});

// 🔥 GERAR PIX
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

    const dados = pagamento.body;

    const id = dados.id;

    // salva status
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

  }catch(e){
    console.log(e);
    res.status(500).json({erro:"Erro ao gerar PIX"});
  }

});

// 🔥 WEBHOOK (recebe confirmação do Mercado Pago)
app.post("/webhook", (req, res) => {

  try{

    const data = req.body;

    if(data.type === "payment"){

      const pagamentoId = data.data.id;

      // marca como pago
      if(pagamentos[pagamentoId]){
        pagamentos[pagamentoId].status = "pago";
        console.log("Pagamento aprovado:", pagamentoId);
      }

    }

    res.sendStatus(200);

  }catch(e){
    console.log(e);
    res.sendStatus(500);
  }

});

// 🔍 CONSULTAR STATUS
app.get("/status/:id", (req,res)=>{

  const id = req.params.id;

  if(!pagamentos[id]){
    return res.json({status:"não encontrado"});
  }

  res.json({
    status: pagamentos[id].status
  });

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, ()=>{
  console.log("Servidor rodando 🚀");
});
