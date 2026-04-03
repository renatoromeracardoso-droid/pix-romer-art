import express from "express"
import cors from "cors"
import axios from "axios"

const app = express()
app.use(cors())
app.use(express.json())

const MP_TOKEN = process.env.MP_TOKEN

let pagamentos = {}
let pedidos = []

// 🔥 GERAR PIX
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
    payer: { email: "teste@teste.com" }
   },
   {
    headers:{
     Authorization: `Bearer ${MP_TOKEN}`,
     "Content-Type":"application/json",
     "X-Idempotency-Key": pedidoId
    }
   }
  )

  const data = response.data

  pagamentos[pedidoId] = {
   status: data.status,
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


// 🔎 STATUS
app.get("/status/:id", async (req,res)=>{

 try{

  const pedido = pagamentos[req.params.id]

  if(!pedido){
    return res.json({status:"pending"})
  }

  const response = await axios.get(
   `https://api.mercadopago.com/v1/payments/${pedido.mpId}`,
   {
    headers:{ Authorization: `Bearer ${MP_TOKEN}` }
   }
  )

  const status = response.data.status

  pagamentos[req.params.id].status = status

  res.json({status})

 }catch(e){
  console.log("Erro status:", e.message)
  res.json({status:"pending"})
 }

})


// 🔔 WEBHOOK
app.post("/webhook", async (req,res)=>{

 try{

  if(req.body.type === "payment"){

    const paymentId = req.body.data.id

    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers:{ Authorization: `Bearer ${MP_TOKEN}` }
      }
    )

    const status = response.data.status

    Object.keys(pagamentos).forEach(key=>{
      if(pagamentos[key].mpId == paymentId){
        pagamentos[key].status = status
      }
    })

  }

  res.sendStatus(200)

 }catch(e){
  console.log("Erro webhook:", e.message)
  res.sendStatus(500)
 }

})


// 🚀 RECEBER PEDIDO
app.post("/pedido",(req,res)=>{

  const pedido = req.body

  pedidos.push(pedido)

  console.log("NOVO PEDIDO:", pedido)

  res.json({ok:true})
})


// 🔥 TESTE
app.get("/", (req,res)=>{
 res.send("Servidor rodando 🚀")
})

app.listen(10000,()=>console.log("Servidor rodando 🚀"))
