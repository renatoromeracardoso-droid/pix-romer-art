import express from "express"
import cors from "cors"
import axios from "axios"

const app = express()
app.use(cors())
app.use(express.json())

const pagamentos = {}

const MP_TOKEN = process.env.MP_TOKEN

// 🚀 GERAR PIX
app.post("/pix", async (req,res)=>{

 try{

  const { valor, pedidoId } = req.body

  const valorFormatado = Number(parseFloat(valor).toFixed(2))

  const response = await axios.post(
   "https://api.mercadopago.com/v1/payments",
   {
    transaction_amount: valorFormatado,
    description: "Pedido Romer Art",
    payment_method_id: "pix",
    payer: {
      email: "teste@teste.com"
    }
   },
   {
    headers:{
     Authorization: `Bearer ${MP_TOKEN}`,
     "Content-Type":"application/json",
     "X-Idempotency-Key": `${pedidoId}`
    }
   }
  )

  const data = response.data

  pagamentos[pedidoId] = {
   status: data.status, // 🔥 vem como pending
   mpId: data.id
  }

  res.json({
   qr: data.point_of_interaction.transaction_data.qr_code_base64,
   copia: data.point_of_interaction.transaction_data.qr_code
  })

 }catch(e){
  console.log("ERRO PIX:", e.response?.data || e.message)
  res.status(500).json({erro:true})
 }

})


// 🔎 STATUS REAL (CONSULTA NO MERCADO PAGO)
app.get("/status/:id", async (req,res)=>{

 const pedido = pagamentos[req.params.id]

 if(!pedido){
  return res.json({status:"pending"})
 }

 try{

  const response = await axios.get(
   `https://api.mercadopago.com/v1/payments/${pedido.mpId}`,
   {
    headers:{
     Authorization: `Bearer ${MP_TOKEN}`
    }
   }
  )

  const status = response.data.status

  pagamentos[req.params.id].status = status

  res.json({status})

 }catch(e){
  console.log("Erro status", e.response?.data || e.message)
  res.json({status:"pending"})
 }

})


// 🔔 WEBHOOK (OPCIONAL)
app.post("/webhook",(req,res)=>{
 console.log("Webhook recebido")
 res.sendStatus(200)
})

app.listen(10000,()=>console.log("Servidor rodando 🚀"))
