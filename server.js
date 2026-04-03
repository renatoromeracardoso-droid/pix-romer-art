import express from "express"
import cors from "cors"
import axios from "axios"
import admin from "firebase-admin"

const app = express()
app.use(cors())
app.use(express.json())

const MP_TOKEN = process.env.MP_TOKEN

// 🔥 FIREBASE
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

let pagamentos = {}

// 🔥 PIX
app.post("/pix", async (req,res)=>{
 try{

  const { valor, pedidoId } = req.body

  const response = await axios.post(
   "https://api.mercadopago.com/v1/payments",
   {
    transaction_amount: Number(parseFloat(valor).toFixed(2)),
    description: "Pedido Romer Art",
    payment_method_id: "pix",
    payer:{ email:"teste@teste.com" }
   },
   {
    headers:{
     Authorization:`Bearer ${MP_TOKEN}`,
     "Content-Type":"application/json",
     "X-Idempotency-Key": pedidoId
    }
   }
  )

  const data = response.data

  pagamentos[pedidoId] = {
    mpId: data.id,
    status: data.status
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

  if(!pedido) return res.json({status:"pending"})

  const response = await axios.get(
    `https://api.mercadopago.com/v1/payments/${pedido.mpId}`,
    { headers:{ Authorization:`Bearer ${MP_TOKEN}` } }
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
      { headers:{ Authorization:`Bearer ${MP_TOKEN}` } }
    )

    const status = response.data.status

    for(const key in pagamentos){
      if(pagamentos[key].mpId == paymentId){

        pagamentos[key].status = status

        await db.collection("pedidos").doc(key).update({
          pagamento: status
        })
      }
    }

  }

  res.sendStatus(200)

 }catch(e){
  console.log("Erro webhook:", e.message)
  res.sendStatus(500)
 }
})


// 🚀 SALVAR PEDIDO
app.post("/pedido", async (req,res)=>{

 try{

  const pedido = req.body

  await db.collection("pedidos").doc(pedido.id).set({
    ...pedido,
    status: "novo",
    pagamento: "approved",
    criadoEm: new Date()
  })

  res.json({ok:true})

 }catch(e){
  console.log("Erro salvar pedido:", e.message)
  res.status(500).json({erro:true})
 }
})


app.listen(10000,()=>console.log("Servidor rodando 🚀"))
