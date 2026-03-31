const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 TOKEN do Render (MP_TOKEN)
mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

// 🧠 banco temporário (memória)
let pagamentos = {};

// 🚀 GERAR PIX
async function gerarPix(){

 if(itens.length===0){
   alert("Adicione item");
   return;
 }

 lista.innerHTML = resumo + "<br><br>⏳ Gerando PIX...";

 try{

   const r = await fetch("https://pix-romer-art.onrender.com/pix",{
     method:"POST",
     headers:{"Content-Type":"application/json"},
     body:JSON.stringify({
       valor:Number(totalFinal.toFixed(2)),
       email:email.value
     })
   });

   const d = await r.json();

   // 🚨 MOSTRA ERRO REAL
   if(d.error){
     lista.innerHTML = resumo + "<br><br>❌ ERRO PIX: "+d.error;
     console.log("ERRO BACKEND:", d);
     return;
   }

   // 🚨 VALIDAÇÃO
   if(!d.qr_code || !d.qr_code_base64){
     lista.innerHTML = resumo + "<br><br>❌ QR inválido";
     console.log("RESPOSTA:", d);
     return;
   }

   lista.innerHTML = resumo + `
   <br><hr><br>

   <b>Pagamento via PIX</b><br><br>

   <img src="data:image/png;base64,${d.qr_code_base64}" width="220"><br><br>

   <textarea id="pixCode" style="width:100%;height:80px;">${d.qr_code}</textarea>

   <button onclick="copiarPix()" class="btn">Copiar PIX</button>

   <br><br>⏳ Aguardando pagamento...
   `;

 }catch(e){
   lista.innerHTML = resumo + "<br><br>❌ Servidor offline";
   console.log("ERRO FETCH:", e);
 }
}
    // 🔥 pega QR com segurança
    const qr = dados?.point_of_interaction?.transaction_data?.qr_code;
    const qrBase64 = dados?.point_of_interaction?.transaction_data?.qr_code_base64;

    // 🚨 validação
    if (!qr || !qrBase64) {
      console.log("❌ ERRO: QR não veio do Mercado Pago");
      console.log(JSON.stringify(dados, null, 2));

      return res.status(500).json({
        error: "Erro ao gerar QR Code PIX"
      });
    }

    // 🔥 salva status inicial
    pagamentos[dados.id] = "pending";

    // ✅ resposta única correta
    res.json({
      id: dados.id,
      qr_code: qr,
      qr_code_base64: qrBase64
    });

  } catch (error) {
    console.log("❌ ERRO PIX:", error);
    res.status(500).json({ error: "Erro ao gerar PIX" });
  }
});

// 🔥 WEBHOOK (Mercado Pago)
app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    if (data.type === "payment") {
      const pagamento = await mercadopago.payment.findById(data.data.id);

      const status = pagamento.body.status;

      pagamentos[data.data.id] = status;

      console.log("💰 Status do pagamento:", status);
    }

    res.sendStatus(200);

  } catch (error) {
    console.log("❌ ERRO WEBHOOK:", error);
    res.sendStatus(500);
  }
});

// 🔎 CONSULTAR STATUS
app.get("/status/:id", (req, res) => {
  const id = req.params.id;

  res.json({
    status: pagamentos[id] || "pending"
  });
});

// 🚀 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(🔥 Servidor rodando na porta ${PORT});
});
