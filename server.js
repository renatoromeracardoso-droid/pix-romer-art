import express from "express"
import mercadopago from "mercadopago"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

// 🔑 TOKEN CORRETO (mp_token como você pediu)
mercadopago.configure({
  access_token: process.env.MP_TOKEN
})

// ROTA PIX
app.post("/pix", async (req, res) => {
  try {

    const { valor } = req.body

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: "teste@teste.com"
      }
    })

    const dados = payment.body

    res.json({
      id: dados.id,
      qr_code_base64: dados.point_of_interaction.transaction_data.qr_code_base64,
      copiaecola: dados.point_of_interaction.transaction_data.qr_code
    })

  } catch (erro) {
    console.log("ERRO PIX:", erro)
    res.status(500).json({ erro: "Erro ao gerar PIX" })
  }
})

// STATUS
app.get("/status/:id", async (req, res) => {
  try {

    const pagamento = await mercadopago.payment.findById(req.params.id)

    res.json({
      status: pagamento.body.status
    })

  } catch (erro) {
    res.status(500).json({ erro: "Erro status" })
  }
})

app.listen(10000, () => {
  console.log("🚀 Servidor rodando")
})
