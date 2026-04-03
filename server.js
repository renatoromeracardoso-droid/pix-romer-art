// 🔥 MEMÓRIA DE PEDIDOS
let pedidos = {};

// 🔥 SALVAR PEDIDO
app.post("/pedido", (req,res)=>{
  const id = Date.now();
  pedidos[id] = {
    ...req.body,
    status: "pendente",
    id
  };
  res.json({ id });
});

// 🔥 LISTAR PEDIDOS
app.get("/pedidos", (req,res)=>{
  res.json(Object.values(pedidos));
});

// 🔥 ATUALIZA STATUS AUTOMATICO
app.get("/status/:id", async (req, res) => {
  try {

    const pagamento = await mercadopago.payment.get(req.params.id);

    let status = pagamento.body.status;

    // 🔥 atualiza no "banco"
    Object.values(pedidos).forEach(p=>{
      if(p.mpId == req.params.id){
        p.status = status;
      }
    });

    res.json({ status });

  } catch (erro) {
    res.status(500).json({ status: "erro" });
  }
});
