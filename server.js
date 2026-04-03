import express from "express"
import mercadopago from "mercadopago"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors())

// 🔥 CONFIG COM MP_TOKEN (SEU CASO)
mercadopago.configure({
  access_token: process.env.MP_TOKEN
})

// ---------------- CRIAR PIX ----------------
app.post("/pix", async (req, res) => {
  try {

    const { valor } = req.body

    if (!valor) {
      return res.status(400).json({ erro: "Valor obrigatório" })
    }

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: "cliente@email.com"
      }
    })

    const dadosPix = payment.body.point_of_interaction.transaction_data

    res.json({
      id: payment.body.id,
      qr_code_base64: dadosPix.qr_code_base64,
      copiaecola: dadosPix.qr_code
    })

  } catch (error) {
    console.log("ERRO PIX:", error)
    res.status(500).json({
      erro: true,
      detalhe: error.message
    })
  }
})

// ---------------- STATUS ----------------
app.get("/status/:id", async (req, res) => {
  try {

    const id = req.params.id

    if (!id) {
      return res.status(400).json({ status: "id inválido" })
    }

    const payment = await mercadopago.payment.get(id)

    res.json({
      status: payment.body.status
    })

  } catch (error) {
    console.log("ERRO STATUS:", error)

    res.status(500).json({
      status: "error",
      detalhe: error.message
    })
  }
})

// ---------------- TESTE ----------------
app.get("/", (req, res) => {
  res.send("API RomerArt rodando 🚀")
})

// ---------------- START ----------------
const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`)
})
