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

// ================= PIX =================
app.post("/pix", async (req,res)=>{

 try{

 let {valor,email} = req.body;

 const pagamento = await mercadopago.payment.create({
   transaction_amount: Number(valor),
   description: "Pedido RomerArt",
   payment_method_id: "pix",
   payer:{email: email || "teste@email.com"}
 });

 res.json({
   id: pagamento.body.id,
   qr_code: pagamento.body.point_of_interaction.transaction_data.qr_code,
   qr_code_base64: pagamento.body.point_of_interaction.transaction_data.qr_code_base64
 });

 }catch(e){
   console.log("ERRO PIX:", e);
   res.status(500).json({erro:"Erro ao gerar PIX"});
 }

});

// ================= STATUS DIRETO MP =================
app.get("/status/:id", async (req,res)=>{

 try{

 const pagamento = await mercadopago.payment.get(req.params.id);

 res.json({
   status: pagamento.body.status
 });

 }catch(e){
   console.log("ERRO STATUS:", e);
   res.status(500).json({status:"erro"});
 }

});

// ROOT
app.get("/",(req,res)=>res.send("Servidor OK 🚀"));

// START
app.listen(process.env.PORT || 10000, ()=>{
 console.log("Servidor rodando 🚀");
});
