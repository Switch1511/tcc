const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../front')));

const db = mysql.createConnection({
    host: 'sql10.freesqldatabase.com',
    user: 'sql10743687',
    port: 3306,
    password: 'JAJVNyBTzu',
    database: 'sql10743687',
    connectionLimit: 10,
    queueLimit: 0
});

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

    if (!nome || !email || !senha) {
        console.log('Campos obrigatórios não preenchidos:', req.body);
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

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

        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) {
                console.error('Erro ao gerar hash da senha:', err);
                return res.status(500).send('Erro ao processar a senha.');
            }

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
    console.log('Endpoint /artigos chamado');
    const getArticlesQuery = 'SELECT * FROM artigos';
    db.query(getArticlesQuery, (err, results) => {
        if (err) return res.status(500).send('Erro ao obter artigos.');
        res.json(results);
    });
});

app.get('/artigos/:id', (req, res) => {
    const { id } = req.params;
    
    const getArticleQuery = 'SELECT * FROM artigos WHERE id = ?';
    db.query(getArticleQuery, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar artigo.' });
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Artigo não encontrado.' });
        }

        res.json(results); // Retorna o artigo encontrado
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