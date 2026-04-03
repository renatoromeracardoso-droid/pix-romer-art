import express from "express"
import cors from "cors"
import mercadopago from "mercadopago"

const app = express()
app.use(cors())
app.use(express.json())

// 🔑 TOKEN (mp_token)
const client = new mercadopago.MercadoPagoConfig({
  accessToken: process.env.MP_TOKEN
})

const payment = new mercadopago.Payment(client)

// 🔥 GERAR PIX
app.post("/pix", async (req, res) => {

  try {

    const { valor } = req.body

    if (!valor || valor < 1) {
      return res.status(400).json({ erro: "Valor inválido" })
    }

    const response = await payment.create({
      body: {
        transaction_amount: Number(valor),
        description: "Pedido RomerArt",
        payment_method_id: "pix",
        payer: {
          email: "teste@teste.com"
        }
      }
    })

    const pix = response.point_of_interaction.transaction_data

    res.json({
      id: response.id,
      qr_code_base64: pix.qr_code_base64,
      copiaecola: pix.qr_code
    })

  } catch (error) {
    console.log("ERRO PIX:", error)
    res.status(500).json({ erro: "Erro ao gerar PIX" })
  }

})

// 🔍 STATUS
app.get("/status/:id", async (req, res) => {

  try {

    const response = await payment.get({
      id: req.params.id
    })

    res.json({
      status: response.status
    })

  } catch (error) {
    console.log("ERRO STATUS:", error)
    res.status(500).json({ erro: "Erro ao consultar status" })
  }

})

// 🚀 START
const PORT = process.env.PORT || 10000
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT)
})
