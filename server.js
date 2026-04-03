import express from "express"
import cors from "cors"
import mercadopago from "mercadopago"

const app = express()
app.use(cors())
app.use(express.json())

// 🔑 TOKEN (vem do Render ENV)
mercadopago.configurations.setAccessToken(process.env.MP_TOKEN)

// 🚀 ROTA PIX
app.post("/pix", async (req, res) => {

  try {

    const { valor } = req.body

    if (!valor) {
      return res.status(400).json({ erro: "Valor não enviado" })
    }

    const pagamento = await mercadopago.payment.create({
      body: {
        transaction_amount: Number(valor),
        description: "Pedido RomerArt",
        payment_method_id: "pix",
        payer: {
          email: "cliente@email.com"
        }
      }
    })

    const data = pagamento.body.point_of_interaction.transaction_data

    res.json({
      id: pagamento.body.id,
      qr_code_base64: data.qr_code_base64,
      copiaecola: data.qr_code
    })

  } catch (error) {
    console.error("ERRO PIX:", error)
    res.status(500).json({ erro: "Erro ao gerar PIX" })
  }

})


// 🔎 STATUS DO PAGAMENTO
app.get("/status/:id", async (req, res) => {

  try {

    const { id } = req.params

    const pagamento = await mercadopago.payment.findById(id)

    res.json({
      status: pagamento.body.status
    })

  } catch (error) {
    console.error("ERRO STATUS:", error)
    res.status(500).json({ erro: "Erro ao consultar status" })
  }

})


// 🚀 START
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT)
})
