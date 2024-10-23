const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;
const path = require('path');

// Middleware para interpretar JSON no corpo da requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../front')));

// Configuração de conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Commandos11!',
    database: 'conecta_pinhais'
});

// Verifica a conexão com o banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL');
});



app.use(cors());

app.post('/usuarios', (req, res) => {
    const { nome, email, senha } = req.body;

    // Verifica se todos os campos foram preenchidos
    if (!nome || !email || !senha) {
        console.log('Campos obrigatórios não preenchidos:', req.body);
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    // Verifica se o e-mail já está cadastrado
    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, result) => {
        if (err) {
            console.error('Erro ao verificar e-mail:', err);
            return res.status(500).send('Erro no servidor.');
        }

        if (result.length > 0) {
            console.log('E-mail já cadastrado:', email);
            return res.status(400).send('Este e-mail já está cadastrado.');
        }

        // Gera um hash da senha
        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) {
                console.error('Erro ao gerar hash da senha:', err);
                return res.status(500).send('Erro ao processar a senha.');
            }

            console.log('Hash gerado:', hash);

            // Insere o novo usuário no banco de dados
            const insertUserQuery = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
            db.query(insertUserQuery, [nome, email, hash], (err, result) => {
                if (err) {
                    console.error('Erro ao cadastrar usuário:', err);
                    return res.status(500).send('Erro ao cadastrar o usuário.');
                }
                console.log('Usuário cadastrado com sucesso:', result);
                res.status(201).send('Usuário cadastrado com sucesso.');
            });
        });
    });
});

// Função para verificar o token JWT
const authenticateToken = (req, res, next) => {
    // Obtém o token e remove a parte 'Bearer '
    const token = req.headers['authorization']?.split(' ')[1]; // Usando split
    // Ou, se preferir usar replace:
    // const token = req.headers['authorization']?.replace('Bearer ', '');

    console.log(token); // Aqui você verá apenas o token

    if (!token) return res.status(401).send('Acesso negado. Token não fornecido.');

    jwt.verify(token, 'segredo', (err, user) => {
        if (err) return res.status(403).send('Token inválido.');
        req.user = user; // O usuário que foi verificado será adicionado ao req
        next();
    });
};

// Endpoint para login de usuário (gera um token JWT)
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const getUserQuery = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(getUserQuery, [email], (err, result) => {
        if (err) return res.status(500).send('Erro no servidor.');

        if (result.length === 0) {
            return res.status(400).send('Usuário não encontrado.');
        }

        const user = result[0];

        bcrypt.compare(senha, user.senha, (err, match) => {
            if (err) return res.status(500).send('Erro no servidor.');

            if (!match) {
                return res.status(400).send('Senha incorreta.');
            }

            const token = jwt.sign({ id: user.id, email: user.email }, 'segredo', { expiresIn: '1h' });
            res.json({ token }); // Envia o token no corpo da resposta
        });
    });
});

// Endpoint para criar um artigo
app.post('/artigos', (req, res) => {
    const { titulo, conteudo, publicado } = req.body;
    const autor_id = 1;

    const insertArticleQuery = 'INSERT INTO artigos (titulo, conteudo, autor_id, publicado) VALUES (?, ?, ?, ?)';
    db.query(insertArticleQuery, [titulo, conteudo, autor_id, publicado || 0], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao criar artigo.' });
        }

        // Envia uma resposta em formato JSON
        res.status(201).json({ message: 'Artigo criado com sucesso.', artigoId: result.insertId });
    });
});

// Endpoint para ler todos os artigos do usuário logado
app.get('/artigos', (req, res) => {
    const autor_id = 1;

    const getArticlesQuery = 'SELECT * FROM artigos WHERE autor_id = ?';
    db.query(getArticlesQuery, [autor_id], (err, results) => {
        if (err) return res.status(500).send('Erro ao obter artigos.');

        res.json(results);
    });
});

app.put('/artigos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { titulo, conteudo, publicado } = req.body;
    const autor_id = 1;

    const updateArticleQuery = 'UPDATE artigos SET titulo = ?, conteudo = ?, publicado = ?, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = ? AND autor_id = ?';
    db.query(updateArticleQuery, [titulo, conteudo, publicado, id, autor_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar artigo.' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Artigo não encontrado ou acesso não autorizado.' });
        }

        res.json({ message: 'Artigo atualizado com sucesso.' });
    });
});

app.delete('/artigos/:id', authenticateToken, (req, res) => {
   
    const { id } = req.params;
    const autor_id = 1;

    const deleteArticleQuery = 'DELETE FROM artigos WHERE id = ? AND autor_id = ?';
    db.query(deleteArticleQuery, [id, autor_id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao excluir artigo.' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Artigo não encontrado ou acesso não autorizado.' });
        }

        res.json({ message: 'Artigo excluído com sucesso.' });
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});