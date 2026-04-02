const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

// CORS
app.use((req,res,next)=>{
 res.header("Access-Control-Allow-Origin","*");
 res.header("Access-Control-Allow-Headers","*");
 res.header("Access-Control-Allow-Methods","*");
 next();
});

// TOKEN
mercadopago.configurations.setAccessToken(process.env.MP_TOKEN);

// BANCO TEMP
let pagamentos = {};

// PIX
app.post("/pix", async (req,res)=>{

 try{

 let {valor,email} = req.body;

 const p = await mercadopago.payment.create({
   transaction_amount: valor,
   description: "Pedido RomerArt",
   payment_method_id: "pix",
   payer:{email:email}
 });

 pagamentos[p.body.id] = "pending";

 res.json({
   id: p.body.id,
   qr_code: p.body.point_of_interaction.transaction_data.qr_code,
   qr_code_base64: p.body.point_of_interaction.transaction_data.qr_code_base64
 });

 }catch(e){
   console.log(e);
   res.status(500).json({erro:"PIX erro"});
 }

});

// STATUS
app.get("/status/:id",(req,res)=>{
 res.json({status:pagamentos[req.params.id]||"pending"});
});

// WEBHOOK
app.post("/webhook", async (req,res)=>{

 try{

 const data = req.body;

 if(data.type === "payment"){

   const pagamento = await mercadopago.payment.get(data.data.id);

   pagamentos[data.data.id] = pagamento.body.status;

   console.log("WEBHOOK:", pagamento.body.status);
 }

 res.sendStatus(200);

 }catch(e){
   console.log(e);
   res.sendStatus(500);
 }

});

// ROOT
app.get("/",(req,res)=>res.send("OK"));

// START
app.listen(process.env.PORT||10000,()=>console.log("Servidor rodando 🚀"));
