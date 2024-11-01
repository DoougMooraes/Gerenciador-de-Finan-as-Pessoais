const express = require('express'); 
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Importa o módulo path
const bcrypt = require('bcrypt'); // Adicione bcrypt para hashear senhas

const app = express();
const port = 5500;

app.use(cors(
    
));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // Serve arquivos estáticos do diretório atual

// Configuração da conexão MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Voyageturbo13.', // Substitua pela sua senha
    database: 'gerenciador_financas'
});

// Conectando ao banco de dados
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL!');
});

// Rota para carregar a página de login como a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // Serve a página de login
});

// Rota para carregar a página de cadastro
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'cadastro.html')); // Serve a página de cadastro
});

// Rota para cadastrar usuário
app.post('/cadastrar', (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
    }

    // Hasheando a senha antes de armazenar
    bcrypt.hash(senha, 10, (err, hash) => {
        if (err) {
            console.error('Erro ao hashear a senha:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
        }

        const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        connection.query(query, [nome, email, hash], (error, results) => {
            if (error) {
                console.error('Erro na consulta:', error);
                return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
            }
            res.status(200).json({ message: 'Usuário cadastrado com sucesso!' });
        });
    });
});

// Rota para autenticação de login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    connection.query(query, [email], (error, results) => {
        if (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            return res.status(500).json({ success: false, message: 'Erro no servidor. Tente novamente mais tarde.' });
        }

        if (results.length > 0) {
            // Verifique a senha usando bcrypt
            const usuario = results[0];
            bcrypt.compare(senha, usuario.senha, (err, match) => {
                if (match) {
                    // Login bem-sucedido
                    res.json({ success: true, usuarioId: usuario.id }); // Retorne o ID do usuário para o front-end
                } else {
                    // Senha incorreta
                    res.json({ success: false, message: 'E-mail ou senha incorretos!' });
                }
            });
        } else {
            // Email não encontrado
            res.json({ success: false, message: 'E-mail ou senha incorretos!' });
        }
    });
});

// Rota para adicionar transação
app.post('/transacao', (req, res) => {
    const { usuarioId, descricao, valor, tipo } = req.body;

    const query = 'INSERT INTO transacoes (usuario_id, descricao, valor, tipo) VALUES (?, ?, ?, ?)';
    connection.query(query, [usuarioId, descricao, valor, tipo], (error, results) => {
        if (error) {
            console.error('Erro ao inserir transação:', error);
            return res.status(500).json({ error: 'Erro ao adicionar transação.' });
        }
        res.status(200).json({ message: 'Transação adicionada com sucesso!' });
    });
});


// Rota para buscar transações do usuário
app.get('/transacoes/:usuarioId', (req, res) => {
    const usuarioId = req.params.usuarioId;

    const sql = 'SELECT * FROM transacoes WHERE usuario_id = ?';
    connection.query(sql, [usuarioId], (error, results) => {
        if (error) {
            console.error('Erro ao buscar transações:', error);
            return res.status(500).json({ message: 'Erro ao buscar transações' });
        }
        res.json(results);
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
