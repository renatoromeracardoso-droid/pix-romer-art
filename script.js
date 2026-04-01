const API = "https://pix-romer-art.onrender.com/pix";

let itens = [];
let tabela = {
  materiais:[],
  produtos:[],
  servicos:[],
  config:[]
};

async function carregarDados(){
 let url = "COLE_URL_JSON_GOOGLE_AQUI";
 let r = await fetch(url);
 let data = await r.json();

 tabela.materiais = data.materiais;
 tabela.produtos = data.produtos;
 tabela.servicos = data.servicos;

 montarSelects();
}

function montarSelects(){

 servico.innerHTML = tabela.servicos.map(s=>`<option>${s.nome}</option>`).join("");

 material.innerHTML = tabela.materiais.map(m=>`<option>${m.nome}</option>`).join("");

 produto.innerHTML = tabela.produtos.map(p=>`<option>${p.nome}</option>`).join("");
}

function addItem(){

 let l = Number(largura.value);
 let a = Number(altura.value);
 let q = Number(qtd.value);

 if(l>400 || a>400){
  alert("Máximo 400mm");
  return;
 }

 let mat = tabela.materiais.find(m=>m.nome===material.value);
 let valorBase = Number(mat.valor_base);

 let valor = ((l*a)/100)*valorBase*q;

 itens.push({l,a,q,valor});

 atualizarResumo();
}

function atualizarResumo(){
 let html="";
 let total=0;

 itens.forEach((i,idx)=>{
  html += `${idx+1}) ${i.l}x${i.a} - R$ ${i.valor.toFixed(2)}<br>`;
  total += i.valor;
 });

 resumo.innerHTML = html;
 totalDiv.innerHTML = "Total: R$ "+total.toFixed(2);
}

async function gerarPix(){

 if(!nome.value || !email.value || !cep.value || !numero.value){
  alert("Preencha os dados");
  return;
 }

 let total = itens.reduce((s,i)=>s+i.valor,0);

 let r = await fetch(API,{
  method:"POST",
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({valor:total})
 });

 let data = await r.json();

 pix.innerHTML = `
 <img src="data:image/png;base64,${data.qr}">
 <textarea>${data.copia}</textarea>
 <p>Aguardando pagamento...</p>
 `;

 verificarPagamento(data.id);
}

async function verificarPagamento(id){

 let tentativas = 0;

 let interval = setInterval(async ()=>{

  let r = await fetch(API+"/status/"+id);
  let data = await r.json();

  if(data.status === "approved"){
    clearInterval(interval);

    pix.innerHTML += "<h3>✅ PAGAMENTO APROVADO</h3>";
    btnEnviar.disabled = false;
  }

  tentativas++;
  if(tentativas>20) clearInterval(interval);

 },3000);
}

function enviarPedido(){
 alert("Pedido enviado via WhatsApp (próximo passo)");
}

carregarDados();
