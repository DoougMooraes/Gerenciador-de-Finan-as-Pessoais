// Escuta o evento de submissão do formulário de login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Evita o comportamento padrão de envio do formulário

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // Envia a solicitação de login para o servidor
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const usuarioId = data.usuarioId; 
            // Armazena o ID do usuário localmente para ser acessado na index.html
            localStorage.setItem('usuarioId', usuarioId); 
            // Redireciona para a página principal após login bem-sucedido
            window.location.href = "index.html";
        } else {
            alert(data.message || "E-mail ou senha incorretos!");
        }
    })
    .catch(error => {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login. Tente novamente mais tarde.');
    });
});

// Função para carregar transações do usuário ao acessar a página index.html
function carregarTransacoes() {
    const usuarioId = localStorage.getItem('usuarioId'); // Obtém o usuário ID do localStorage

    if (!usuarioId) {
        console.error('ID de usuário não encontrado. Por favor, faça o login novamente.');
        window.location.href = "login.html"; // Redireciona para a tela de login se o ID do usuário não for encontrado
        return;
    }

    // Limpa o histórico antes de carregar as novas transações
    historicoTransacoes.innerHTML = ''; // Limpa a lista existente

    // Busca as transações do usuário pelo ID
    fetch(`http://localhost:5500/transacoes/${usuarioId}`)
        .then(response => response.json())
        .then(transacoes => {
            transacoes.forEach(transacao => {
                adicionarTransacaoAoHistorico(transacao.descricao, transacao.valor, transacao.tipo);
                atualizarSaldos(transacao.valor, transacao.tipo);
            });
            atualizarResumo(); // Atualiza o resumo das finanças
            atualizarGrafico(); // Atualiza o gráfico com as transações
        })
        .catch(error => console.error('Erro ao carregar transações:', error));
}

// Verifica se a página index.html está carregada e chama carregarTransacoes
window.onload = () => {
    if (window.location.pathname.includes("index.html")) {
        carregarTransacoes();
    }
};
