function emitirNota(id, nome, cpf, email, serviço, valor) {

  const url = https://hook.us2.make.com/qwcebgltw3f2zljt8f25olpxtmnh8s72?pedido=${id}&nome=${nome}&cpf=${cpf}&email=${email}&servico=${servico}&valor=${valor};

  fetch(url)
    .then(() => {
      alert("Nota enviada com sucesso 🚀");
    })
    .catch(() => {
      alert("Erro ao enviar nota ❌");
    });

}
