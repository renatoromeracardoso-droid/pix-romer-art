import express from "express"
import cors from "cors"
import pkg from "mercadopago"

const { MercadoPagoConfig, Payment } = pkg

const app = express()
app.use(express.json())
app.use(cors())

// 🔥 CONFIG CORRETA
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_TOKEN
})

const payment = new Payment(client)

// ------------------ PIX ------------------
app.post("/pix", async (req, res) => {
  try {

    const { valor } = req.body

    const response = await payment.create({
      body: {
        transaction_amount: Number(valor),
        description: "Pedido RomerArt",
        payment_method_id: "pix",
        payer: {
          email: "comprador@email.com"
        }
      }
    })

    res.json({
      id: response.id,
      status: response.status,
      qr_code: response.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ erro: "Erro ao gerar PIX" })
  }
})

// ------------------ STATUS (🔥 CORRIGIDO) ------------------
app.get("/status/:id", async (req, res) => {
  try {

    const { id } = req.params

    const response = await payment.get({ id })

    console.log("STATUS REAL:", response.status)

    res.json({
      status: response.status
    })

  } catch (error) {
    console.log("ERRO STATUS:", error)
    res.status(500).json({ erro: "Erro ao consultar status" })
  }
})

// ------------------ SERVER ------------------
app.get("/", (req, res) => {
  res.send("API funcionando 🚀")
})

app.listen(process.env.PORT || 10000, () => {
  console.log("Servidor rodando 🚀")
})
