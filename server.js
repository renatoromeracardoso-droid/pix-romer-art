import express from "express"
import mercadopago from "mercadopago"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

mercadopago.configure({
  access_token: process.env.MP_TOKEN
})

// 🔥 CRIAR PIX
app.post("/pix", async (req, res) => {

  try{

    const { total, pedido } = req.body

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(total),
      description: `Pedido ${pedido}`,
      payment_method_id: "pix",
      payer: {
        email: "comprador@email.com"
      }
    })

    res.json({
      id: pagamento.body.id,
      qr_code: pagamento.body.point_of_interaction.transaction_data.qr_code,
      qr_base64: pagamento.body.point_of_interaction.transaction_data.qr_code_base64
    })

  }catch(e){
    res.status(500).json({ erro: e.message })
  }

})

// 🔥 STATUS
app.get("/status/:id", async (req, res) => {

  try{
    const pagamento = await mercadopago.payment.findById(req.params.id)

    res.json({
      status: pagamento.body.status
    })

  }catch(e){
    res.status(500).json({ erro: e.message })
  }

})

app.listen(10000, ()=> console.log("Servidor rodando"))
