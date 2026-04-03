const express = require("express")
const cors = require("cors")
const mercadopago = require("mercadopago")

const app = express()
app.use(cors())
app.use(express.json())

// 🔑 TOKEN CERTO (mp_token)
mercadopago.configure({
  access_token: process.env.MP_TOKEN
})

// 🔥 ROTA PIX
app.post("/pix", async (req, res) => {

  try {

    const { valor } = req.body

    if (!valor || valor < 1) {
      return res.status(400).json({ erro: "Valor inválido" })
    }

    const pagamento = await mercadopago.payment.create({
      body: {
        transaction_amount: Number(valor),
        description: "Pedido RomerArt",
        payment_method_id: "pix",
        payer: {
          email: "teste@teste.com"
        }
      }
    })

    const dadosPix = pagamento.body.point_of_interaction.transaction_data

    res.json({
      id: pagamento.body.id,
      qr_code_base64: dadosPix.qr_code_base64,
      copiaecola: dadosPix.qr_code
    })

  } catch (error) {
    console.log("ERRO PIX:", error)
    res.status(500).json({ erro: "Erro ao gerar PIX" })
  }

})

// 🔍 ROTA STATUS
app.get("/status/:id", async (req, res) => {

  try {

    const id = req.params.id

    const pagamento = await mercadopago.payment.findById(id)

    res.json({
      status: pagamento.body.status
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
