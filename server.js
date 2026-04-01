const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mercadopago.configure({
 access_token: "SEU_TOKEN_MP"
});

app.post("/pix", async (req,res)=>{

 try{

  let valor = Number(req.body.valor);

  if(!valor || valor <= 0){
   return res.status(400).json({erro:"Valor inválido"});
  }

  let pagamento = await mercadopago.payment.create({
   transaction_amount: valor,
   payment_method_id: "pix",
   payer:{email:"teste@email.com"}
  });

  res.json({
   id: pagamento.body.id,
   qr: pagamento.body.point_of_interaction.transaction_data.qr_code_base64,
   copia: pagamento.body.point_of_interaction.transaction_data.qr_code
  });

 }catch(e){
  console.log(e);
  res.status(500).json({erro:"Erro PIX"});
 }

});

app.get("/pix/status/:id", async (req,res)=>{

 let pagamento = await mercadopago.payment.get(req.params.id);

 res.json({status: pagamento.body.status});
});

app.listen(3000, ()=>console.log("Servidor rodando 🚀"));
