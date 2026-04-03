import express from "express"
import mercadopago from "mercadopago"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

// 🔥 SEU ACCESS TOKEN
mercadopago.configure({
  access_token: "SEU_ACCESS_TOKEN_AQUI"
})

// GERAR PIX
app.post("/pix", async (req, res) => {

  try {

    let valor = Number(req.body.valor)

    if (!valor || valor <= 0) {
      return res.status(400).json({ erro: "Valor inválido" })
    }

    console.log("VALOR RECEBIDO:", valor)

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: "teste@teste.com"
      }
    })

    res.json({
      id: pagamento.body.id,
      qr_code_base64: pagamento.body.point_of_interaction.transaction_data.qr_code_base64,
      copiaecola: pagamento.body.point_of_interaction.transaction_data.qr_code
    })

  } catch (erro) {
    console.log("ERRO PIX:", erro)
    res.status(500).json({ erro: erro.message })
  }

})

// STATUS PIX
app.get("/status/:id", async (req, res) => {

  try {

    const pagamento = await mercadopago.payment.findById(req.params.id)

    res.json({
      status: pagamento.body.status
    })

  } catch (erro) {
    res.status(500).json({ erro: erro.message })
  }

})

app.listen(10000, () => console.log("🚀 Servidor rodando"))
