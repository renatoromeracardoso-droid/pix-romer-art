import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import pkg from "mercadopago";

const { MercadoPagoConfig, Payment } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// 🔐 CONFIG MERCADO PAGO
// ===============================
const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN
});

// ===============================
// 📊 LINKS DAS PLANILHAS
// ===============================
const SHEETS = {
  config: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=170544498&single=true&output=csv",
  servicos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=51228853&single=true&output=csv",
  produtos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=189072882&single=true&output=csv",
  materiais: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=0&single=true&output=csv"
};

// ===============================
// 🔄 CONVERTER CSV → JSON
// ===============================
function csvToJson(csv) {
  const lines = csv.split("\n").filter(l => l.trim() !== "");
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim();
    });
    return obj;
  });
}

// ===============================
// 📥 BUSCAR PLANILHAS
// ===============================
async function getSheet(url) {
  const res = await fetch(url);
  const text = await res.text();
  return csvToJson(text);
}

// ===============================
// 💰 CALCULAR VALOR
// ===============================
app.post("/calcular", async (req, res) => {
  try {
    const { servico, material, espessura, largura, altura, quantidade, produto } = req.body;

    if (!servico || !largura || !altura || !quantidade) {
      return res.status(400).json({ erro: "Dados incompletos" });
    }

    const config = await getSheet(SHEETS.config);
    const servicos = await getSheet(SHEETS.servicos);
    const materiais = await getSheet(SHEETS.materiais);
    const produtos = await getSheet(SHEETS.produtos);

    const serv = servicos.find(s => s.nome === servico);
    if (!serv) throw new Error("Serviço não encontrado");

    let base = 0;

    // 🔹 CORTE usa material
    if (servico !== "Gravação") {
      const mat = materiais.find(m => m.nome === material);
      if (!mat) throw new Error("Material não encontrado");

      base = Number(mat.valor_base) || 0;
    }

    // 🔹 GRAVAÇÃO usa produto
    if (servico === "Gravação") {
      const prod = produtos.find(p => p.nome === produto);
      if (!prod) throw new Error("Produto não encontrado");

      base = Number(prod.preco) || 0;
    }

    let area = (Number(largura) * Number(altura)) / 100;
    let valor = area * base * Number(serv.multiplicador || 1) * Number(quantidade);

    // mínimo
    if (valor < Number(serv.base_minima)) {
      valor = Number(serv.base_minima);
    }

    return res.json({
      valor: Number(valor.toFixed(2))
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro no cálculo - verifique planilha" });
  }
});

// ===============================
// 💳 GERAR PIX
// ===============================
app.post("/pix", async (req, res) => {
  try {
    const { valor, descricao, email } = req.body;

    if (!valor) {
      return res.status(400).json({ erro: "Valor inválido" });
    }

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: Number(valor),
        description: descricao || "Pedido Laser",
        payment_method_id: "pix",
        payer: {
          email: email || "teste@email.com"
        }
      }
    });

    return res.json({
      qr_code: result.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
      id: result.id
    });

  } catch (e) {
    console.error("ERRO PIX:", e);
    return res.status(500).json({ erro: "Erro ao gerar PIX" });
  }
});

// ===============================
// 🚀 START
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando 🚀"));
