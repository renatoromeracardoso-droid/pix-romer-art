import express from "express"
import cors from "cors"
import pkg from "mercadopago"

const { MercadoPagoConfig, Payment } = pkg

const app = express()
app.use(express.json())
app.use(cors())

// 🔥 CONFIG NOVA
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_TOKEN
})

const payment = new Payment(client)

// ---------------- PIX ----------------
app.post("/pix", async (req, res) => {
  try {

    const { valor } = req.body

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

    const dados = response.point_of_interaction.transaction_data

    res.json({
      id: response.id,
      qr_code_base64: dados.qr_code_base64,
      copiaecola: dados.qr_code
    })

  } catch (error) {
    console.log("ERRO PIX:", error)
    res.status(500).json({ erro: true })
  }
})

// ---------------- STATUS ----------------
app.get("/status/:id", async (req, res) => {
  try {

    const id = req.params.id

    const response = await payment.get({ id })

    res.json({
      status: response.status
    })

  } catch (error) {
    console.log("ERRO STATUS:", error)
    res.status(500).json({ status: "error" })
  }
})

// ---------------- TESTE ----------------
app.get("/", (req, res) => {
  res.send("API funcionando 🚀")
})

const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀")
})
