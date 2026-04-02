// ================= VARIÁVEIS =================
let itens = [];
let pago = false;
const WHATS = "5511946447040";

// ================= LIMITES TEMPO REAL =================
larg.oninput = ()=>{ if(larg.value > 400) larg.value = 400; }
alt.oninput = ()=>{ if(alt.value > 400) alt.value = 400; }

// ================= VALIDAÇÃO CLIENTE =================
function validarCliente(){

 if(!cliente.value.trim()){
   alert("Nome obrigatório");
   return false;
 }

 if(!email.value.trim()){
   alert("Email obrigatório");
   return false;
 }

 if(!cep.value.trim()){
   alert("CEP obrigatório");
   return false;
 }

 if(!numero.value.trim()){
   alert("Número obrigatório");
   return false;
 }

 return true;
}

// ================= CEP =================
cep.onblur = async ()=>{

 let c = cep.value.replace(/\D/g,'');

 if(c.length !== 8) return;

 let r = await fetch("https://viacep.com.br/ws/"+c+"/json/");
 let d = await r.json();

 endereco.value = d.logradouro || "";
 bairro.value = d.bairro || "";
 cidade.value = d.localidade || "";
}

// ================= ADD ITEM =================
function addItem(){

 if(!validarCliente()) return;

 let l = Number(larg.value);
 let a = Number(alt.value);
 let q = Number(qtd.value);

 if(!l || !a || !q){
   alert("Preencha medidas corretamente");
   return;
 }

 // 🔥 GARANTIA LIMITE
 if(l > 400 || a > 400){
   alert("Máximo permitido: 400mm");
   return;
 }

 let valor = ((l*a)/100)*0.1*q + 2;

 itens.push({l,a,q,valor});

 render();
}

// ================= RESUMO COMPLETO =================
function render(){

 let total = 0;

 let html = `
 <b>Resumo do Pedido</b><br><br>

 Nome: ${cliente.value}<br>
 Email: ${email.value}<br>
 CEP: ${cep.value}<br>
 Endereço: ${endereco.value}, ${numero.value}<br>
 ${bairro.value} - ${cidade.value}<br><br>
 `;

 itens.forEach((i,x)=>{

   total += i.valor;

   html += `
   ${x+1}) ${i.l}x${i.a} mm<br>
   Quantidade: ${i.q}<br>
   Valor: R$ ${i.valor.toFixed(2)}<br><br>
   `;
 });

 let desc = total * 0.05;
 if(desc > total) desc = 0;

 let final = total - desc;
 if(final < 15) final = 15;

 html += `
 Subtotal: R$ ${total.toFixed(2)}<br>
 Desconto PIX: -R$ ${desc.toFixed(2)}<br>
 <b>Total: R$ ${final.toFixed(2)}</b>
 `;

 resumo.innerHTML = html;
}

// ================= PIX =================
function gerarPix(){

 if(!validarCliente()) return;

 if(itens.length === 0){
   alert("Adicione item");
   return;
 }

 let total = itens.reduce((s,i)=>s+i.valor,0);
 let final = total - total*0.05;

 if(final < 15) final = 15;

 fetch("https://pix-romer-art.onrender.com/pix",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
     valor: final,
     email: email.value
   })
 })
 .then(r=>r.json())
 .then(d=>{

 resumo.innerHTML += `
 <br><br>
 <img src="data:image/png;base64,${d.qr_code_base64}" width="200"><br>
 <textarea style="width:100%">${d.qr_code}</textarea><br>
 <b id="status">Aguardando pagamento...</b>
 `;

 verificar(d.id);

 });
}

// ================= STATUS =================
function verificar(id){

 let tentativas = 0;

 let t = setInterval(()=>{

 fetch("https://pix-romer-art.onrender.com/status/"+id)
 .then(r=>r.json())
 .then(d=>{

 if(d.status === "approved"){
   status.innerHTML = "✅ Pagamento aprovado";
   btnWhats.style.display = "block";
   pago = true;
   clearInterval(t);
 }

 });

 tentativas++;
 if(tentativas > 40) clearInterval(t);

 },3000);

}

// ================= WHATS =================
function enviarWhats(){

 if(!pago){
   alert("Pagamento não confirmado");
   return;
 }

 let txt = resumo.innerText;

 window.open("https://wa.me/"+WHATS+"?text="+encodeURIComponent(txt));
}
