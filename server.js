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

// MEMÓRIA
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
   console.log("ERRO PIX:", e);
   res.status(500).json({erro:"PIX erro"});
 }

});

// STATUS
app.get("/status/:id",(req,res)=>{
 res.json({status:pagamentos[req.params.id] || "pending"});
});

// WEBHOOK CORRIGIDO
app.post("/webhook", async (req,res)=>{

 try{

 const body = req.body;

 if(body.type === "payment"){

   const id = body.data.id;

   const pagamento = await mercadopago.payment.get(id);

   pagamentos[id] = pagamento.body.status;

   console.log("STATUS ATUALIZADO:", id, pagamento.body.status);
 }

 res.sendStatus(200);

 }catch(e){
   console.log("ERRO WEBHOOK:", e);
   res.sendStatus(500);
 }

});

app.get("/",(req,res)=>res.send("OK"));

app.listen(process.env.PORT||10000,()=>console.log("Servidor ON 🚀"));
