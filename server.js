const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

app.get("/", (req,res)=>{
 res.send("Servidor OK");
});

app.post("/pix", async (req,res)=>{

 try{

   const { valor, email } = req.body;

   if(!valor){
     return res.status(400).json({error:"valor obrigatório"});
   }

   const pagamento = await mercadopago.payment.create({
     transaction_amount: Number(parseFloat(valor)),
     description: "Pedido Romer Art",
     payment_method_id: "pix",
     payer: {
       email: email || "romerartbrasil@gmail.com"
     }
   });

   const dados = pagamento.body;

   const tx = dados.point_of_interaction.transaction_data;

   return res.json({
     id: dados.id,
     qr_code: tx.qr_code,
     qr_code_base64: tx.qr_code_base64
   });

 }catch(e){
   console.log(e);
   res.status(500).json({error:"erro pix"});
 }

});

const PORT = process.env.PORT || 10000;
app.listen(PORT,()=> console.log("rodando",PORT));
