import express from "express"
import mercadopago from "mercadopago"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

mercadopago.configure({
  access_token: process.env.MP_TOKEN
})

// 🔥 GERAR PIX
app.post("/pix", async (req, res) => {
  try {

    let { valor } = req.body

    valor = Number(valor)

    // 🔥 evita erro do Mercado Pago
    if (!valor || valor < 5) {
      valor = 5.00
    }

    console.log("VALOR FINAL ENVIADO:", valor)

    const pagamento = await mercadopago.payment.create({
      transaction_amount: valor,
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: "cliente@romerart.com"
      }
    })

    const dados = pagamento.body

    res.json({
      id: dados.id,
      qr_code_base64: dados.point_of_interaction.transaction_data.qr_code_base64,
      copiaecola: dados.point_of_interaction.transaction_data.qr_code
    })

  } catch (erro) {
    console.log("ERRO PIX:", erro)
    res.status(500).json({ erro: erro.message })
  }
})

// 🔥 STATUS PIX
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
  console.log("🚀 Servidor rodando na porta 10000")
})
