const express = require("express");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());

// ===== LIBERAR CORS (IMPORTANTÍSSIMO) =====
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// ===== TOKEN MERCADO PAGO =====
mercadopago.configure({
  access_token: "SEU_TOKEN_AQUI"
});

// ===== CRIAR PIX =====
app.post("/pix", async (req, res) => {

  try{

    let valor = Number(req.body.valor);

    if(!valor || valor <= 0){
      return res.status(400).json({erro:"Valor inválido"});
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor.toFixed(2)),
      description: "Pedido RomerArt",
      payment_method_id: "pix",
      payer: {
        email: "teste@teste.com"
      }
    });

    const dados = pagamento.body;

    res.json({
      id: dados.id,
      qr: dados.point_of_interaction.transaction_data.qr_code_base64,
      copia: dados.point_of_interaction.transaction_data.qr_code
    });

  }catch(e){
    console.log("ERRO PIX:", e.message);
    res.status(500).json({erro:"Erro ao gerar PIX"});
  }

});

// ===== STATUS =====
app.get("/pix/status/:id", async (req,res)=>{

  try{

    let pagamento = await mercadopago.payment.findById(req.params.id);

    res.json({
      status: pagamento.body.status
    });

  }catch{
    res.status(500).json({erro:"Erro status"});
  }

});

app.listen(3000, ()=> console.log("Servidor rodando 🚀"));
