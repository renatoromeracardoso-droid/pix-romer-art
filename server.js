import express from "express"
import cors from "cors"
import mercadopago from "mercadopago"

const app = express()
app.use(cors())
app.use(express.json())

// 🔑 TOKEN
mercadopago.configure({
  access_token: process.env.MP_TOKEN
})

// 🚀 PIX
app.post("/pix", async (req, res) => {

  try {

    const { valor } = req.body

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: "cliente@email.com"
      }
    })

    const data = pagamento.response.point_of_interaction.transaction_data

    res.json({
      id: pagamento.response.id,
      qr_code_base64: data.qr_code_base64,
      copiaecola: data.qr_code
    })

  } catch (error) {
    console.error("ERRO PIX:", error)
    res.status(500).json({ erro: "Erro ao gerar PIX" })
  }

})

// 🔎 STATUS
app.get("/status/:id", async (req, res) => {

  try {

    const pagamento = await mercadopago.payment.findById(req.params.id)

    res.json({
      status: pagamento.response.status
    })

  } catch (error) {
    console.error("ERRO STATUS:", error)
    res.status(500).json({ erro: "Erro ao consultar status" })
  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("🚀 Rodando na porta", PORT)
})
