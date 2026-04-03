import express from "express"
import cors from "cors"
import fetch from "node-fetch"

const app = express()
app.use(express.json())
app.use(cors())

const TOKEN = process.env.MP_TOKEN

// ---------------- PIX ----------------
app.post("/pix", async (req, res) => {
  try {

    const { valor } = req.body

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: "Pedido RomerArt",
        payment_method_id: "pix",
        payer: {
          email: "teste@email.com"
        }
      })
    })

    const data = await response.json()

    res.json({
      id: data.id,
      status: data.status,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64
    })

  } catch (error) {
    console.log("ERRO PIX:", error)
    res.status(500).json({ erro: "Erro ao gerar PIX" })
  }
})

// ---------------- STATUS (🔥 CORRETO MESMO) ----------------
app.get("/status/:id", async (req, res) => {
  try {

    const { id } = req.params

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TOKEN}`
      }
    })

    const data = await response.json()

    console.log("STATUS REAL:", data.status)

    res.json({
      status: data.status
    })

  } catch (error) {
    console.log("ERRO STATUS:", error)
    res.status(500).json({ erro: "Erro ao consultar status" })
  }
})

// ---------------- SERVER ----------------
app.get("/", (req, res) => {
  res.send("API funcionando 🚀")
})

app.listen(process.env.PORT || 10000, () => {
  console.log("Servidor rodando 🚀")
})
