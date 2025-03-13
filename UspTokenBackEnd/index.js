require("dotenv").config();

const port = process.env.PORT ?? 3000;
const JWTsecret = process.env.SECRET;
const JWTexpiresIn = process.env.EXPIRES_IN;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;

const db = require("./db");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.CORS_ORIGIN, // Usa o valor definido no .env
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'] 
}));

console.log("Starting backend...");

function generateAccessToken(nusp) {
    return jwt.sign({nusp: nusp}, JWTsecret, { expiresIn: JWTexpiresIn });
}

function generateRefreshToken(nusp) {
    return jwt.sign({nusp: nusp}, refreshTokenSecret, { expiresIn: refreshTokenExpiresIn });
}

function verifyJWT(req, res, next) {
    const accessToken = req.headers['x-access-token'];

    if (!accessToken) {
        return res.status(401).json({ message: "Token de acesso ausente!" });
    }

    jwt.verify(accessToken, JWTsecret, (error, decoded) => {
        if (error) {
            console.error("Erro ao verificar o token:", error.message);
            return res.status(401).json({ message: "Token inválido ou expirado!" });
        }

        next();
    });
}

app.get("/check-token", verifyJWT, async (req, res) => {

    try {

        res.status(200).json({ validToken: true });

    } catch (error) {

        console.error("Erro ao verificar validade do token:", error);
        res.status(401).send("Token inválido"); // Retorna um erro 401 em caso de falha
    
    }

})

app.get("/get-num-users", async (req, res) => {

    try {

        const numUsers = await db.getNumUsers();
        res.status(200).json({ "numUsers": numUsers.count });

    } catch (error) {

        console.error("Erro ao consultar a quantidade de usuários:", error);
        res.status(501); // Retorna um erro 401 em caso de falha
    
    }

})

app.post("/new-user-token", async (req, res) => {
    
    const accessToken = generateAccessToken(req.body.nusp);
    const refreshToken = generateRefreshToken(req.body.nusp);
    
    // Definir o refresh token no cookie HTTP-only
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Impede acesso via JavaScript (protege contra XSS)
        secure: process.env.NODE_ENV === "production", // Somente HTTPS em produção
        sameSite: "Strict", // Impede envio do cookie em requisições de sites externos
        maxAge: refreshTokenExpiresIn // Expira em 7 dias
    });

    res.status(200).json({auth: true, token: accessToken});

});

app.post("/login", async (req, res) => {
    try {
        const userData = await db.getUserData(req.body.key);

        if (!userData) {
            return res.status(401).json({ message: "Falha na autenticação" });
        }

        bcrypt.compare(req.body.senha, userData.senha, async (error, result) => {
            if (error || !result) {
                return res.status(401).json({ message: "Falha na autenticação" });
            }

            if (result) {
                const accessToken = generateAccessToken(userData.nusp);
                const refreshToken = generateRefreshToken(userData.nusp);

                // 🔹 Define o Refresh Token como um cookie HTTP-only
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,   // Impede acesso via JavaScript (proteção contra XSS)
                    secure: process.env.SECURE, // Somente HTTPS em produção
                    sameSite: process.env.SAME_SITE, // Evita envio de cookies para sites terceiros (proteção contra CSRF)
                    maxAge: refreshTokenExpiresIn // Expira em 7 dias
                });

                // 🔹 Retorna apenas o access token no JSON (refresh token fica no cookie)
                res.status(200).json({
                    auth: true,
                    token: accessToken,
                    nome: userData.nome,
                    nusp: userData.nusp,
                    endereco_ethereum: userData.endereco_ethereum,
                    carteira: userData.carteira
                });
            }
        });
    } catch (error) {
        console.error("Erro ao buscar dados de login:", error);
        res.status(500).send("Erro ao buscar dados de login"); // Retorna um erro 500 em caso de falha
    }
});

app.post("/refresh-token", (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ error: "Refresh token ausente" });

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err || db.refreshTokenExists(refreshToken) !== refreshToken) return res.status(403).json({ error: "Token inválido" });

        const newAccessToken = generateAccessToken(user);
        res.json({ token: newAccessToken });
    });
});

app.get("/logout", verifyJWT, async (req, res) => {

    //const refreshToken = req.headers['x-refresh-token'];
    const refreshToken = req.cookies.refreshToken;

    try {

        const decoded = jwt.decode(refreshToken);
        const resInsercao = await db.insertBlacklist(refreshToken, decoded.exp);
        if(!resInsercao) {
            res.status(401).json({ message: "Falha ao processar logout!" });
        }
        res.status(200).json({ message: "Logout realizado com sucesso!" });

    } catch (error) {
        console.error("Falha ao processar logout!", error);
        res.status(500).send("Falha ao processar logout"); // Retorna um erro 500 em caso de falha
    }

});

app.post("/confirm-tx", verifyJWT, async (req, res) => {
    try {

        const userData = await db.getUserPassword(req.nusp);

        if (!userData) {
            res.status(401).json({ auth: false });
        }else {
            bcrypt.compare(req.body.senha, userData.senha, (error, result) => {
                if(error || !result) {
                    res.status(401).json({ auth: false });
                }
                if(result) {
                    res.status(200).json({ auth: true });
                }           
            });
        }
    } catch (error) {
        console.error("Erro ao realizar autenticação:", error);
        res.status(500).send("Erro ao realizar autenticação"); // Retorna um erro 500 em caso de falha
    }
});

app.post("/get-address", async (req, res) => {
    try {

        let userAddr;
        const argType = req.body.type;
        if(argType == "email"){

            userAddr = await db.getUserAddressByEmail(req.body.key);

        }else if(argType == "nusp"){

            userAddr = await db.getUserAddressByNusp(req.body.key);

        }else if(argType == "nome"){

            userAddr = await db.getUserAddressByName(req.body.key);

        }

        if (userAddr == null) {
            // Se nenhum dado foi encontrado, envie uma resposta com status 404
            res.status(404).json({ message: "Dados não encontrados" });
        } else {
            // Se dados foram encontrados, envie os dados como JSON com status 200
            res.status(200).json(userAddr);
        }
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        res.status(500).send("O sistema falhou em obter os dados requisitados."); // Retorna um erro 500 em caso de falha
    }
});

app.post("/tx", verifyJWT, async (req, res) => {
    try {
        const userData = await db.getReceiver(req.body.key);
        if (userData == null) {
            // Se nenhum dado foi encontrado, envie uma resposta com status 404
            res.status(404).json({ message: "Destinatário não encontrado" });
        } else {
            // Se dados foram encontrados, envie os dados como JSON com status 200
            res.status(200).json(userData);
        }
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        res.status(500).send("O sistema falhou em obter os dados do usuário."); // Retorna um erro 500 em caso de falha
    }
});

app.post("/users", async (req, res) => {

    bcrypt.hash(req.body.senha, 10, async (bcryptError, hash) => {

        if(bcryptError) {

            res.status(500).send({ erro: bcryptError });

        }

        req.body.senha = hash;

        const response = await db.insertUser(req.body);

        res.status(response.status).send(response.body);
    })
    
})

app.delete("/users-delete", verifyJWT, async (req, res) => {

    //const refreshToken = req.headers['x-refresh-token'];
    const refreshToken = req.cookies.refreshToken;
    const decoded = jwt.decode(refreshToken);

    try {
        // Tenta deletar o usuário do banco de dados
        const response = await db.deleteUser(decoded.nusp);

        // Verifica se a operação foi bem-sucedida
        if (response) {
            res.status(200).send({ message: "Exclusão de conta bem-sucedida!" });
        } else {
            res.status(404).send({ message: "Usuário não encontrado." });
        }
    } catch (error) {
        // Caso ocorra algum erro no processo, retorna uma resposta de erro
        res.status(500).send({ error: "Ocorreu um erro durante a tentativa de exclusão de conta." });
    }
});

app.listen(port);

console.log("Backend running...");