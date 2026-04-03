import express from "express"
import cors from "cors"
import axios from "axios"

const app = express()
app.use(cors())
app.use(express.json())

const pagamentos = {}

// 🔑 TOKEN
const MP_TOKEN = process.env.MP_TOKEN

// 🚀 GERAR PIX
app.post("/pix", async (req,res)=>{

 try{

  const { valor, pedidoId } = req.body

  const response = await axios.post(
   "https://api.mercadopago.com/v1/payments",
   {
    transaction_amount: Number(valor),
    description: "Pedido Romer Art",
    payment_method_id: "pix",
    payer: {
      email: "teste@teste.com"
    }
   },
   {
    headers:{
     Authorization: `Bearer ${MP_TOKEN}`,
     "Content-Type":"application/json"
    }
   }
  )

  const pix = response.data.point_of_interaction.transaction_data

  pagamentos[pedidoId] = {
   status: "pending",
   mpId: response.data.id
  }

  res.json({
   qr: pix.qr_code_base64,
   copia: pix.qr_code
  })

 }catch(e){
  console.log("ERRO PIX:", e.response?.data || e.message)
  res.status(500).json({erro:true})
 }

})


// 🔎 STATUS
app.get("/status/:id",(req,res)=>{
 const p = pagamentos[req.params.id]
 res.json({status: p?.status || "pending"})
})


// 🔔 WEBHOOK
app.post("/webhook",(req,res)=>{

 try{

  const data = req.body

  if(data.type === "payment"){

   const id = data.data.id

   Object.keys(pagamentos).forEach(key=>{
    if(pagamentos[key].mpId == id){
     pagamentos[key].status = "approved"
     console.log("PAGAMENTO APROVADO:", key)
    }
   })
  }

  res.sendStatus(200)

 }catch(e){
  console.log("Erro webhook", e)
  res.sendStatus(500)
 }

})

app.listen(10000,()=>console.log("Servidor rodando 🚀"))
