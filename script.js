// Captura dos elementos do DOM
const form = document.getElementById('transacao-form');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const tipoSelect = document.getElementById('tipo');
const totalEntradas = document.getElementById('total-entradas');
const totalSaidas = document.getElementById('total-saidas');
const saldo = document.getElementById('saldo');
const historicoTransacoes = document.getElementById('historico-transacoes');
const orcamentoEntradaInput = document.getElementById('orcamento-entrada');
const orcamentoSaidaInput = document.getElementById('orcamento-saida');
const avisoOrcamento = document.getElementById('aviso-orcamento');

let usuarioId = localStorage.getItem('usuarioId');
let orcamentoEntrada = 0;
let orcamentoSaida = 0;
let receitasMensais = Array(12).fill(0);
let despesasMensais = Array(12).fill(0);
let entradas = 0;
let saidas = 0;


window.onload = () => {
    // Verifica se o usuário está logado
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
        window.location.href = "login.html"; // Redireciona para a página de login se não estiver logado
    } else {
        inicializarGrafico(); // Inicializa o gráfico uma vez
        carregarTransacoes(); // Se estiver logado, carrega as transações
    }
};

document.getElementById('sair-button').addEventListener('click', () => {
    // Limpa o ID do usuário do localStorage
    localStorage.removeItem('usuarioId');
    // Redireciona para a página de login
    window.location.href = "login.html"; // Certifique-se de que o caminho está correto
});

// Função para adicionar transação ao histórico
function adicionarTransacaoAoHistorico(descricao, valor, tipo) {
    const li = document.createElement('li'); // Certifique-se de que 'li' está definido aqui
    li.textContent = `${descricao}: R$ ${valor.toFixed(2)} (${tipo})`; // Use 'valor.toFixed' apenas se 'valor' for um número
    historicoTransacoes.appendChild(li);
}

// Função para carregar as transações ao fazer login
function carregarTransacoes() {
    if (!usuarioId) {
        console.error('ID de usuário não encontrado. Por favor, faça o login novamente.');
        return;
    }

    fetch(`http://localhost:5500/transacoes/${usuarioId}`)
        .then(response => response.json())
        .then(transacoes => {
            historicoTransacoes.innerHTML = ''; // Limpa o histórico antes de adicionar novos itens
            transacoes.forEach(transacao => {
                const descricao = transacao.descricao || 'Não especificado';
                const valor = transacao.valor || 0.00;
                const tipo = transacao.tipo || 'Não definido';
                
                adicionarTransacaoAoHistorico(descricao, valor, tipo);
                atualizarSaldos(valor, tipo);
            });
            atualizarResumo();
            atualizarGrafico();
        })
        .catch(error => console.error('Erro ao carregar transações:', error));
}


// Configuração do gráfico
const ctx = document.getElementById('meuGrafico').getContext('2d');
const meuGrafico = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        datasets: [{
            label: 'Receitas',
            data: receitasMensais,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        },
        {
            label: 'Despesas',
            data: despesasMensais,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Função para adicionar transação
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const descricao = descricaoInput.value || 'mercado';
    const valor = parseFloat(valorInput.value) || 100;
    const tipo = tipoSelect.value || 'saida';

    fetch('http://localhost:5500/transacao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuarioId, descricao, valor, tipo })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            adicionarTransacaoAoHistorico(descricao, valor, tipo);
            atualizarSaldos(valor, tipo);
            verificarOrcamento();

            atualizarGrafico();
            atualizarResumo();
            form.reset();
        }
    })
    .catch(error => console.error('Erro ao adicionar transação:', error));
});

// Função para atualizar saldos
function atualizarSaldos(valor, tipo) {
    const mes = new Date().getMonth();
    if (tipo === 'entrada') {
        receitasMensais[mes] += parseFloat(valor); // Adicione parseFloat aqui
        entradas += parseFloat(valor); // E aqui
    } else {
        despesasMensais[mes] += parseFloat(valor); // E aqui
        saidas += parseFloat(valor); // E aqui
    }
}

// Função para atualizar o resumo
function atualizarResumo() {
    totalEntradas.textContent = parseFloat(entradas).toFixed(2); // Adicione parseFloat aqui
    totalSaidas.textContent = parseFloat(saidas).toFixed(2); // Adicione parseFloat aqui
    saldo.textContent = (parseFloat(entradas) - parseFloat(saidas)).toFixed(2); // Adicione parseFloat aqui
}


// Função para atualizar o gráfico
function adicionarTransacaoAoHistorico(descricao, valor, tipo) {
    const lista = document.getElementById("historico-transacoes");
    const item = document.createElement("li");

    // Garantir que valor seja um número
    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico)) {
        console.error('Valor inválido:', valor);
        return; // Não adiciona se o valor não for um número
    }

    item.textContent = `${tipo === "entrada" ? "+" : "-"} R$${valorNumerico.toFixed(2)} - ${descricao}`;
    item.className = tipo; // Adiciona classe 'entrada' ou 'saida' para CSS
    lista.appendChild(item);
}



    // Converta o valor para número se não for
    const valorNumerico = typeof valor === 'number' ? valor : parseFloat(valor) || 0;


 // Limpa o histórico antes de carregar as novas transações
     historicoTransacoes.innerHTML = ''; // Limpa a lista existente

    fetch(`http://localhost:5500/transacoes/${usuarioId}`)
        .then(response => response.json())
        .then(transacoes => {
            console.log('Transações carregadas:', transacoes); // Adicione este log para depuração
            transacoes.forEach(transacao => {
                const descricao = transacao.descricao || 'Não especificado';
                const valor = transacao.valor || 0.00;
                const tipo = transacao.tipo || 'Não definido';
                
                adicionarTransacaoAoHistorico(descricao, valor, tipo);
                atualizarSaldos(valor, tipo);
            });
            atualizarResumo(); // Atualiza o resumo após carregar as transações
            atualizarGrafico(); // Atualiza o gráfico após carregar as transações
        })
        .catch(error => console.error('Erro ao carregar transações:', error));


// Função para definir orçamentos
document.getElementById('orcamento-form').addEventListener('submit', (e) => {
    e.preventDefault();
    orcamentoEntrada = parseFloat(orcamentoEntradaInput.value) || 0;
    orcamentoSaida = parseFloat(orcamentoSaidaInput.value) || 0;
    verificarOrcamento();
    orcamentoEntradaInput.value = '';
    orcamentoSaidaInput.value = '';
});

// Função para verificar orçamentos
function verificarOrcamento() {
    avisoOrcamento.textContent = '';
    if (entradas > orcamentoEntrada && orcamentoEntrada > 0) {
        avisoOrcamento.innerHTML += `<p>Atenção: Orçamento de Entrada ultrapassado!</p>`;
    }
    if (saidas > orcamentoSaida && orcamentoSaida > 0) {
        avisoOrcamento.innerHTML += `<p>Atenção: Orçamento de Saída ultrapassado!</p>`;
    }
}

// Função para exportar em PDF
document.getElementById('exportar-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Histórico de Transações", 10, 10);

    const transacoes = document.querySelectorAll('#historico-transacoes li');
    let y = 20;
    transacoes.forEach(transacao => {
        doc.text(transacao.textContent, 10, y);
        y += 10;
    });

    doc.save('transacoes.pdf');
});
