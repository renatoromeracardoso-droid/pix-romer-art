import express from "express"
import fetch from "node-fetch"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

const MP_TOKEN = process.env.MP_TOKEN

// 🔥 ROTA TESTE
app.get("/", (req, res) => {
  res.send("Servidor PIX rodando 🚀")
})


// 🔥 GERAR PIX
app.post("/pix", async (req, res) => {
  try {

    const { valor } = req.body

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": Date.now().toString()
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: "Pedido RomerArt",
        payment_method_id: "pix",
        payer: {
          email: "cliente@romerart.com"
        }
      })
    })

    const data = await response.json()

    console.log("PIX RESPONSE:", data)

    const qr =
      data.point_of_interaction?.transaction_data?.qr_code_base64

    const copia =
      data.point_of_interaction?.transaction_data?.qr_code

    res.json({
      id: data.id,
      qr_code_base64: qr,
      copiaecola: copia
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ erro: "Erro ao gerar PIX" })
  }
})


// 🔥 STATUS PIX
app.get("/status/:id", async (req, res) => {
  try {

    const id = req.params.id

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`
        }
      }
    )

    const data = await response.json()

    console.log("STATUS:", data.status)

    res.json({
      status: data.status
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ status: "erro" })
  }
})


// 🔥 PORTA
const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀 na porta", PORT)
})
