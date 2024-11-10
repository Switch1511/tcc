const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;
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

    // Função para criar usuário com retries
    const retryCreateUser = (retries = 0) => {
        const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
        
        // Verifica se o email já existe
        db.query(checkEmailQuery, [email], (err, result) => {
            if (err) {
                console.error(`Erro ao verificar e-mail. Tentativa ${retries + 1}`);
                
                // Tentar novamente após 1 segundo se for erro 500 e limite de tentativas não foi atingido
                if (retries < 5) {
                    setTimeout(() => retryCreateUser(retries + 1), 1000);
                } else {
                    return res.status(500).send('Erro no servidor. Tentativas esgotadas.');
                }
                return;
            }

            if (result.length > 0) {
                console.log('E-mail já cadastrado:', email);
                return res.status(400).send('Este e-mail já está cadastrado.');
            }

            // Gera o hash da senha e insere o novo usuário
            bcrypt.hash(senha, 10, (err, hash) => {
                if (err) {
                    console.error(`Erro ao gerar hash da senha. Tentativa ${retries + 1}`);
                    
                    // Retry para falha no hash
                    if (retries < 5) {
                        setTimeout(() => retryCreateUser(retries + 1), 1000);
                    } else {
                        return res.status(500).send('Erro ao processar a senha. Tentativas esgotadas.');
                    }
                    return;
                }

                const insertUserQuery = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
                db.query(insertUserQuery, [nome, email, hash], (err, result) => {
                    if (err) {
                        console.error(`Erro ao cadastrar usuário. Tentativa ${retries + 1}`);
                        
                        // Retry para falha na inserção do usuário
                        if (retries < 5) {
                            setTimeout(() => retryCreateUser(retries + 1), 1000);
                        } else {
                            return res.status(500).send('Erro ao cadastrar o usuário. Tentativas esgotadas.');
                        }
                        return;
                    }

                    console.log('Usuário cadastrado com sucesso:', result);
                    res.status(201).send('Usuário cadastrado com sucesso.');
                });
            });
        });
    };

    // Chama a função retryCreateUser pela primeira vez
    retryCreateUser();
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

    const retryLogin = (retries = 0) => {
        const getUserQuery = 'SELECT * FROM usuarios WHERE email = ?';

        // Busca o usuário no banco
        db.query(getUserQuery, [email], (err, result) => {
            if (err) {
                console.error(`Erro ao buscar usuário. Tentativa ${retries + 1}`);
                
                // Tentar novamente após 1 segundo se for erro 500 e limite de tentativas não foi atingido
                if (retries < 5) {
                    setTimeout(() => retryLogin(retries + 1), 1000);
                } else {
                    return res.status(500).send('Erro no servidor. Tentativas esgotadas.');
                }
                return;
            }

            if (result.length === 0) {
                return res.status(400).send('Usuário não encontrado.');
            }

            const user = result[0];

            bcrypt.compare(senha, user.senha, (err, match) => {
                if (err) {
                    console.error(`Erro ao comparar senha. Tentativa ${retries + 1}`);
                    
                    // Retry para erro no bcrypt
                    if (retries < 5) {
                        setTimeout(() => retryLogin(retries + 1), 1000);
                    } else {
                        return res.status(500).send('Erro ao processar a senha. Tentativas esgotadas.');
                    }
                    return;
                }

                if (!match) {
                    return res.status(400).send('Senha incorreta.');
                }

                const token = jwt.sign({ id: user.id, email: user.email }, 'segredo', { expiresIn: '1h' });
                res.json({ token }); // Envia o token no corpo da resposta
            });
        });
    };

    // Chama a função retryLogin pela primeira vez
    retryLogin();
});


// Endpoint para criar um artigo
app.post('/artigos', (req, res) => {
    const { titulo, conteudo, publicado } = req.body;
    const autor_id = 1;

    const retryInsertArticle = (retries = 0) => {
        const insertArticleQuery = 'INSERT INTO artigos (titulo, conteudo, autor_id, publicado) VALUES (?, ?, ?, ?)';

        db.query(insertArticleQuery, [titulo, conteudo, autor_id, publicado || 0], (err, result) => {
            if (err) {
                console.error(`Erro ao criar artigo. Tentativa ${retries + 1}`);

                // Se houver erro 500 e o limite de tentativas ainda não foi atingido, tenta novamente
                if (retries < 5) {
                    setTimeout(() => retryInsertArticle(retries + 1), 1000);
                } else {
                    return res.status(500).json({ error: 'Erro ao criar artigo. Tentativas esgotadas.' });
                }
                return;
            }

            // Envia uma resposta em formato JSON
            res.status(201).json({ message: 'Artigo criado com sucesso.', artigoId: result.insertId });
        });
    };

    // Chama a função retryInsertArticle pela primeira vez
    retryInsertArticle();
});


// Endpoint para ler todos os artigos do usuário logado
app.get('/artigos', (req, res) => {
    console.log('Endpoint /artigos chamado');

    // Função para tentar a consulta com retries
    const retryQuery = (retries = 0) => {
        const getArticlesQuery = 'SELECT * FROM artigos';

        db.query(getArticlesQuery, (err, results) => {
            if (err) {
                console.error(`Erro ao obter artigos. Tentativa ${retries + 1}`);
                
                // Tentar novamente após 1 segundo se for erro 500
                if (retries < 20) { // Limita o número de tentativas para evitar loop infinito
                    setTimeout(() => retryQuery(retries + 1), 1000);
                } else {
                    return res.status(500).send('Erro ao obter artigos. Tentativas esgotadas.');
                }
            } else {
                // Sucesso: retorna os resultados
                res.json(results);
            }
        });
    };

    // Chama a função retryQuery pela primeira vez
    retryQuery();
});
app.get('/artigos/:id', (req, res) => {
    const { id } = req.params;

    const retryGetArticle = (retries = 0) => {
        const getArticleQuery = 'SELECT * FROM artigos WHERE id = ?';

        db.query(getArticleQuery, [id], (err, results) => {
            if (err) {
                console.error(`Erro ao buscar artigo. Tentativa ${retries + 1}`);

                // Se houver erro 500 e ainda não atingiu o limite de tentativas, tenta novamente
                if (retries < 5) {
                    setTimeout(() => retryGetArticle(retries + 1), 1000);
                } else {
                    return res.status(500).json({ error: 'Erro ao buscar artigo. Tentativas esgotadas.' });
                }
                return;
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Artigo não encontrado.' });
            }

            res.json(results); // Retorna o artigo encontrado
        });
    };

    // Chama a função retryGetArticle pela primeira vez
    retryGetArticle();
});


app.put('/artigos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { titulo, conteudo, publicado } = req.body;
    const autor_id = 1;

    const retryUpdateArticle = (retries = 0) => {
        const updateArticleQuery = `
            UPDATE artigos 
            SET titulo = ?, conteudo = ?, publicado = ?, ultima_atualizacao = CURRENT_TIMESTAMP 
            WHERE id = ? AND autor_id = ?`;

        db.query(updateArticleQuery, [titulo, conteudo, publicado, id, autor_id], (err, result) => {
            if (err) {
                console.error(`Erro ao atualizar artigo. Tentativa ${retries + 1}`);

                // Verifica se o erro é 500 e tenta novamente até 5 vezes
                if (retries < 5) {
                    return setTimeout(() => retryUpdateArticle(retries + 1), 1000);
                } else {
                    return res.status(500).json({ error: 'Erro ao atualizar artigo. Tentativas esgotadas.' });
                }
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Artigo não encontrado ou acesso não autorizado.' });
            }

            res.json({ message: 'Artigo atualizado com sucesso.' });
        });
    };

    // Primeira chamada para a função de atualização com repetição
    retryUpdateArticle();
});


app.delete('/artigos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const autor_id = 1;

    const retryDeleteArticle = (retries = 0) => {
        const deleteArticleQuery = 'DELETE FROM artigos WHERE id = ? AND autor_id = ?';
        db.query(deleteArticleQuery, [id, autor_id], (err, result) => {
            if (err) {
                console.error(`Erro ao excluir artigo. Tentativa ${retries + 1}`);

                // Verifica se é erro 500 e tenta novamente até 5 vezes
                if (retries < 5) {
                    return setTimeout(() => retryDeleteArticle(retries + 1), 1000);
                } else {
                    return res.status(500).json({ error: 'Erro ao excluir artigo. Tentativas esgotadas.' });
                }
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Artigo não encontrado ou acesso não autorizado.' });
            }

            res.json({ message: 'Artigo excluído com sucesso.' });
        });
    };

    // Primeira chamada para a função de exclusão com repetição
    retryDeleteArticle();
});

app.listen(port, () => console.log("Server ready on port 3000."));

module.exports = app;