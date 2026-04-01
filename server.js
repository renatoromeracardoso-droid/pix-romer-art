const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔑 TOKEN (COLOQUE O SEU AQUI)
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// TESTE
app.get("/", (req,res)=>{
  res.send("Servidor OK");
});

// PIX
app.post("/pix", async (req,res)=>{
  try{

    const { valor, email } = req.body;

    if(!valor){
      return res.status(400).json({erro:"valor obrigatório"});
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido Romer Art",
      payment_method_id: "pix",
      payer: {
        email: email || "cliente@email.com"
      }
    });

    const tx = pagamento.body.point_of_interaction.transaction_data;

    res.json({
      qr: tx.qr_code,
      img: tx.qr_code_base64
    });

  }catch(e){
    console.log(e);
    res.status(500).json({erro:"erro pix"});
  }
});

app.listen(process.env.PORT || 10000, ()=>{
  console.log("Servidor rodando");
});
// ===== WEBHOOK =====
app.post("/webhook", async (req,res)=>{

  try{

    console.log("WEBHOOK RECEBIDO:", req.body);

    if(req.body.type === "payment"){

      const paymentId = req.body.data.id;

      const pagamento = await mercadopago.payment.findById(paymentId);

      const status = pagamento.body.status;

      console.log("STATUS:", status);

      if(status === "approved"){
        console.log("✅ PAGAMENTO APROVADO");
        // aqui você pode salvar no banco depois
      }

    }

    res.sendStatus(200);

  }catch(e){
    console.log("ERRO WEBHOOK:", e);
    res.sendStatus(500);
  }

});
