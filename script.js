const API = "https://pix-romer-art.onrender.com/pix";

let itens = [];

let tabela = {
  materiais: [],
  produtos: [],
  servicos: [],
  config: []
};

// 🔥 CONVERTER CSV PRA JSON
function csvToJson(csv) {
  let linhas = csv.split("\n");
  let headers = linhas[0].split(",");

  return linhas.slice(1).map(linha => {
    let valores = linha.split(",");
    let obj = {};
    headers.forEach((h, i) => obj[h.trim()] = valores[i]?.trim());
    return obj;
  });
}

// 🔥 CARREGAR TODAS AS PLANILHAS
async function carregarDados() {

  const urls = {
    config: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=170544498&output=csv",
    servicos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=51228853&output=csv",
    produtos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=189072882&output=csv",
    materiais: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=0&output=csv"
  };

  for (let key in urls) {
    let r = await fetch(urls[key]);
    let text = await r.text();
    tabela[key] = csvToJson(text);
  }

  montarSelects();
}

// 🔥 MONTAR SELECTS
function montarSelects() {

  servico.innerHTML = tabela.servicos
    .map(s => `<option value="${s.nome}">${s.nome}</option>`)
    .join("");

  material.innerHTML = tabela.materiais
    .map(m => `<option value="${m.nome}">${m.nome}</option>`)
    .join("");

  atualizarProdutos();
}

// 🔥 FILTRAR PRODUTOS POR SERVIÇO
function atualizarProdutos() {

  let serv = servico.value;

  let filtrados = tabela.produtos.filter(p => {

    if (serv === "Corte" && p.permite_corte === "não") return false;

    return true;
  });

  produto.innerHTML = filtrados
    .map(p => `<option value="${p.nome}">${p.nome}</option>`)
    .join("");
}

servico.addEventListener("change", atualizarProdutos);

// 🔥 ADICIONAR ITEM
function addItem() {

  let l = Number(largura.value);
  let a = Number(altura.value);
  let q = Number(qtd.value);

  if (!l || !a || !q) {
    alert("Preencha medidas e quantidade");
    return;
  }

  if (l > 400 || a > 400) {
    alert("Máximo permitido: 400mm");
    return;
  }

  let mat = tabela.materiais.find(m => m.nome === material.value);

  if (!mat) {
    alert("Material não encontrado");
    return;
  }

  let valorBase = Number(mat.valor_base || 0.1);

  let valor = ((l * a) / 100) * valorBase * q;

  itens.push({
    material: material.value,
    produto: produto.value,
    servico: servico.value,
    l, a, q, valor
  });

  atualizarResumo();
}

// 🔥 RESUMO
function atualizarResumo() {

  let html = "";
  let total = 0;

  itens.forEach((i, idx) => {
    html += `${idx + 1}) ${i.produto} - ${i.l}x${i.a} - R$ ${i.valor.toFixed(2)}<br>`;
    total += i.valor;
  });

  document.getElementById("resumo").innerHTML = html;
  document.getElementById("total").innerHTML = "Total: R$ " + total.toFixed(2);
}

// 🔥 GERAR PIX
async function gerarPix() {

  if (!nome.value || !email.value || !cep.value || !numero.value) {
    alert("Preencha os dados obrigatórios");
    return;
  }

  let total = itens.reduce((s, i) => s + i.valor, 0);

  try {

    let r = await fetch(API, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: total })
    });

    let data = await r.json();

    document.getElementById("pix").innerHTML = `
      <img src="data:image/png;base64,${data.qr}">
      <textarea>${data.copia}</textarea>
      <p>Aguardando pagamento...</p>
    `;

    verificarPagamento(data.id);

  } catch (e) {
    alert("Erro ao gerar PIX");
  }
}

// 🔥 STATUS AUTOMÁTICO
async function verificarPagamento(id) {

  let tentativas = 0;

  let interval = setInterval(async () => {

    let r = await fetch(API + "/status/" + id);
    let data = await r.json();

    if (data.status === "approved") {
      clearInterval(interval);

      document.getElementById("pix").innerHTML += "<h3>✅ PAGAMENTO APROVADO</h3>";
      document.getElementById("btnEnviar").disabled = false;
    }

    tentativas++;
    if (tentativas > 20) clearInterval(interval);

  }, 3000);
}

// 🔥 INICIAR
carregarDados();
