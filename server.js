const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");

const app = express();
app.use(express.json());

// 🔥 LIBERA CORS TOTAL
app.use(cors());

mercadopago.configure({
 access_token: process.env.MP_ACCESS_TOKEN
});

app.post("/pix", async (req, res) => {
 try {

  const pagamento = await mercadopago.payment.create({
   transaction_amount: Number(req.body.valor),
   description: "Pedido RomerArt",
   payment_method_id: "pix",
   payer: {
    email: "teste@email.com"
   }
  });

  const qr = pagamento.body.point_of_interaction.transaction_data.qr_code_base64;
  const copia = pagamento.body.point_of_interaction.transaction_data.qr_code;

  res.json({ qr, copia });

 } catch (err) {
  console.log(err);
  res.status(500).json({ erro: "erro pix" });
 }
});

app.get("/", (req,res)=>{
 res.send("Servidor rodando");
});

app.listen(process.env.PORT || 3000);
