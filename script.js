const API = "https://pix-romer-art.onrender.com/pix";
const WHATS = "5511946447040";

let itens = [];

let tabela = {
  materiais: [],
  produtos: [],
  servicos: []
};

// ===== CSV =====
function csvToJson(csv){
  let linhas = csv.trim().split("\n");
  let headers = linhas[0].split(",").map(h => h.trim());

  return linhas.slice(1).map(l => {
    let valores = l.split(",");
    let obj = {};

    headers.forEach((h,i)=>{
      obj[h] = valores[i] ? valores[i].trim() : "";
    });

    return obj;
  }).filter(l => Object.values(l).some(v => v));
}

// ===== LOAD =====
async function carregarDados(){

  const urls={
    servicos:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=51228853&output=csv",
    produtos:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=189072882&output=csv",
    materiais:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-EWqn0pnDWtXB4Jz54d4OuVzcb9VEVKWU5cHYr76cc_RjKc76Mt00s51AEfOAbrx2T_xsBnriDFeH/pub?gid=0&output=csv"
  };

  for(let key in urls){
    let r = await fetch(urls[key]);
    let t = await r.text();
    tabela[key] = csvToJson(t);
  }

  montarSelects();
}

// ===== SELECTS =====
function montarSelects(){

  servico.innerHTML = '<option value="">Serviço</option>' +
    tabela.servicos.map(s=>`<option>${s.nome}</option>`).join("");

  material.innerHTML = '<option value="">Material</option>' +
    tabela.materiais.map(m=>`<option>${m.nome}</option>`).join("");

  atualizarProdutos();
}

// ===== REGRA INTELIGENTE =====
function atualizarProdutos(){

  let serv = servico.value;

  let lista = tabela.produtos.filter(p => {

    // corte → só quem permite corte
    if(serv === "Corte" && p.permite_corte === "não") return false;

    return true;
  });

  produto.innerHTML = '<option value="">Produto</option>' +
    lista.map(p=>`<option>${p.nome}</option>`).join("");
}

servico.onchange = atualizarProdutos;

// ===== CEP =====
cep.onblur = async ()=>{
  let c = cep.value.replace(/\D/g,'');

  if(c.length !== 8) return;

  let r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
  let d = await r.json();

  endereco.value = d.logradouro || "";
  bairro.value = d.bairro || "";
  cidade.value = d.localidade || "";
};

// ===== LIMITES =====
largura.oninput = ()=>{ if(largura.value > 400) largura.value = 400; }
altura.oninput  = ()=>{ if(altura.value > 400) altura.value = 400; }

// ===== VALIDAÇÃO PROFISSIONAL =====
function validar(){

  if(!nome.value) return "Informe o nome";
  if(!email.value) return "Informe o email";
  if(!cep.value) return "Informe o CEP";
  if(!numero.value) return "Informe o número";
  if(!servico.value) return "Selecione serviço";
  if(!material.value) return "Selecione material";
  if(!produto.value) return "Selecione produto";

  return null;
}

// ===== CALCULO PROFISSIONAL =====
function calcularValor(l,a,q){

  let mat = tabela.materiais.find(m => m.nome === material.value);

  let base = Number(mat?.valor_base || 0);

  if(base <= 0) return 0;

  let area = (l * a) / 100;

  let custoMaterial = area * base;

  let custoTempo = area * 0.04;

  let custo = custoMaterial + custoTempo + 1;

  let lucro = custo * 0.5;

  let total = custo + lucro;

  if(servico.value === "Gravação") total *= 1.2;
  if(servico.value === "Corte + Gravação") total *= 1.5;

  total *= q;

  if(total < 15*q) total = 15*q;

  return total;
}

// ===== ADD =====
function addItem(){

  let erro = validar();
  if(erro){ alert(erro); return; }

  let l = Number(largura.value);
  let a = Number(altura.value);
  let q = Number(qtd.value);

  if(!l || !a){ alert("Informe medidas"); return; }

  if(l > 400 || a > 400){
    alert("Máximo 400mm");
    return;
  }

  let valor = calcularValor(l,a,q);

  if(valor <= 0){
    alert("Erro no cálculo (ver planilha)");
    return;
  }

  itens.push({
    servico: servico.value,
    material: material.value,
    produto: produto.value,
    l,a,q,valor
  });

  render();
}

// ===== RESUMO PROFISSIONAL =====
function render(){

  let total = 0;

  let html = `<b>Pedido #${Date.now().toString().slice(-6)}</b><br><br>
  Cliente: ${nome.value}<br>
  Email: ${email.value}<br>
  Endereço: ${endereco.value}, ${numero.value} - ${bairro.value} - ${cidade.value}<br><br>`;

  itens.forEach((i,x)=>{
    total += i.valor;

    html += `${x+1}) ${i.servico}<br>
    ${i.material} | ${i.produto}<br>
    ${i.l}x${i.a}mm | Qtd:${i.q}<br>
    R$ ${i.valor.toFixed(2)}<br><br>`;
  });

  let desconto = total * 0.05;
  let final = total - desconto;

  html += `
  Subtotal: R$ ${total.toFixed(2)}<br>
  Desconto PIX: -R$ ${desconto.toFixed(2)}<br>
  <b>Total: R$ ${final.toFixed(2)}</b><br><br>
  Prazo: 2 a 5 dias úteis<br>
  Frete calculado após confirmação
  `;

  resumo.innerHTML = html;
}

// ===== PIX =====
async function gerarPix(){

  let erro = validar();
  if(erro){ alert(erro); return; }

  if(itens.length === 0){
    alert("Adicione item");
    return;
  }

  let total = itens.reduce((s,i)=>s+i.valor,0);
  let final = total - (total*0.05);

  pix.innerHTML = "⏳ Gerando pagamento...";

  let r = await fetch(API,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({valor:Number(final.toFixed(2))})
  });

  let d = await r.json();

  if(!d.qr){
    pix.innerHTML = "Erro ao gerar PIX";
    return;
  }

  pix.innerHTML = `
  <img src="data:image/png;base64,${d.qr}" width="200"><br>
  <textarea style="width:100%">${d.copia}</textarea>
  <p>⏳ Aguardando pagamento...</p>
  `;

  statusPix(d.id);
}

// ===== STATUS =====
function statusPix(id){

  let i = setInterval(async()=>{

    let r = await fetch(API+"/status/"+id);
    let d = await r.json();

    if(d.status === "approved"){
      clearInterval(i);

      pix.innerHTML += "<br><b style='color:#22c55e;'>Pagamento aprovado!</b>";
      btnEnviar.disabled = false;
    }

  },3000);
}

// ===== WHATS =====
function enviarWhats(){
  window.open("https://wa.me/"+WHATS+"?text="+encodeURIComponent(resumo.innerText));
}

// ===== START =====
carregarDados();
