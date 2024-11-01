// Adicionar código para manipulação do formulário de cadastro aqui
document.getElementById('cadastro-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Previne o envio do formulário

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // Enviar os dados para o servidor
    fetch('/cadastrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email, senha })
    })
    .then(response => {
        console.log('Resposta do servidor:', response); // Adicione isso
        if (!response.ok) {
            throw new Error('Erro ao cadastrar o usuário');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message); // Mensagem de sucesso
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao cadastrar o usuário. Detalhes: ' + error.message);
    });
});
