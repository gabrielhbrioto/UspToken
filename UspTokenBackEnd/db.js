async function connect() {

    if(global.connection)
        return global.connection.connect();

    const { Pool } = require("pg");
    const pool = new Pool({
        connectionString : process.env.CONNECTION_STRING
    });

    const client = await pool.connect();
    console.log("Pool de conexão criado");

    const res = await client.query("select now()");
    console.log(res.rows[0]);
    client.release();

    global.connection = pool;

    return pool.connect();

}

connect();

async function insertBlacklist(token, expires_in) {

    const client = await connect();

    try {
        const query = 'INSERT INTO BLACKLIST (TOKEN, EXPIRES_IN) VALUES ($1, to_timestamp($2))';
        const values = [token, expires_in];
        const res = await client.query(query, values);
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        if (client) client.release();
    }
    return true;

}


async function insertUser(user) {

    const client = await connect();
    let response;

    let sql = "SELECT COUNT(*) FROM USUARIOS WHERE EMAIL = $1 OR NUSP = $2 OR ENDERECO_ETHEREUM = $3";
    let values = [user.email, user.nusp, user.enderecoEthereum];
    let res = await client.query(sql, values);

    if(res.rows[0].count == 0){

        sql = "INSERT INTO USUARIOS(NUSP, NOME, EMAIL, SENHA, ENDERECO_ETHEREUM, CARTEIRA) VALUES($1, $2, $3, $4, $5, $6)";
        values = [user.nusp, user.nome, user.email, user.senha, user.enderecoEthereum, user.carteiraCriptografada];
        res = client.query(sql, values);

        response = {
            status: 201,
            body: {
                mensagem: "Informações já cadastradas."
            }
        }

    }else {

        response = {
            status: 500,
            body: {
                mensagem: "Informações já cadastradas."
            }
        }

    } 

    if (client) client.release();
        
    return response;
    
}

async function inBlacklist(token) {

    const client = await connect();
    try {
        const sql = "SELECT * FROM BLACKLIST WHERE TOKEN = $1";
        const values = [token];
        const res = await client.query(sql, values);
        return (res.rows.length > 0);
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        throw error;
    } finally {
        if (client) client.release();
    }

}

async function getUserData(key) {

    const client = await connect();
    const sql = "SELECT NUSP, NOME, CARTEIRA, SENHA, ENDERECO_ETHEREUM FROM USUARIOS WHERE EMAIL = $1 OR NUSP = $2 OR ENDERECO_ETHEREUM = $3";
    const values = [key, key, key];
    const res = await client.query(sql, values);

    if (client) client.release();

    return res.rows[0];

}

async function getUserPassword(key) {

    const client = await connect();
    const sql = "SELECT SENHA FROM USUARIOS WHERE NUSP = $1";
    const values = [key];
    const res = await client.query(sql, values);

    if (client) client.release();

    return res.rows[0];

}

async function getUserAddressByName(name) {

    const client = await connect();
    const sql = "SELECT ENDERECO_ETHEREUM FROM USUARIOS WHERE NOME ILIKE $1";
    const values = [`%${name}%`];
    const res = await client.query(sql, values);

    if (client) client.release();

    return res.rows;

}

async function getUserAddressByNusp(nusp) {

    const client = await connect();
    const sql = "SELECT ENDERECO_ETHEREUM FROM USUARIOS WHERE NUSP = $1";
    const values = [nusp];
    const res = await client.query(sql, values);

    if (client) client.release();

    return res.rows[0];
    
}

async function getUserAddressByEmail(email) {

    const client = await connect();
    const sql = "SELECT ENDERECO_ETHEREUM FROM USUARIOS WHERE EMAIL = $1";
    const values = [email];
    const res = await client.query(sql, values);

    if (client) client.release();

    return res.rows[0];

}

async function getReceiver(key) {

    const client = await connect();
    const sql = "SELECT NOME, ENDERECO_ETHEREUM FROM USUARIOS WHERE EMAIL = $1 OR NUSP = $2 OR ENDERECO_ETHEREUM = $3"
    const values = [key, key, key];
    const res = await client.query(sql, values);

    if (client) client.release();

    return res.rows[0];
    
}

async function getNumUsers() {

    const client = await connect();
    const sql = "SELECT COUNT(*) FROM usuarios"
    const res = await client.query(sql);

    if (client) client.release();

    return res.rows[0];

}

async function updateUser(user, prevNusp) {

    const client = await connect();
    const sql = "UPDATE USUARIOS SET NUSP = $1, NOME = $2, EMAIL = $3, SENHA = $4 WHERE nusp = $5";
    values = [user.nusp, user.nome, user.email, user.senha, prevNusp];
    const res = await client.query(sql, values);

    if (client) client.release();

    return (res.rowCount > 0);

}

async function deleteUser(nusp) {

    const client = await connect();
    const sql = "DELETE FROM USUARIOS WHERE NUSP = $1";
    const values = [nusp];
    const res = await client.query(sql, values);

    if (client) client.release();

    return (res.rowCount > 0);

}

async function deleteExpiredRows() {

    const client = await connect();
    await client.query('DELETE FROM BLACKLIST WHERE EXPIRES_IN < NOW()');
    if (client) client.release();

}

setInterval(deleteExpiredRows, 900000); // 900000 ms = 15 min

module.exports = {
    insertBlacklist,
    inBlacklist,
    insertUser,
    getUserData,
    getReceiver,
    getUserPassword,
    getUserAddressByName,
    getUserAddressByNusp,
    getUserAddressByEmail,
    getNumUsers,
    deleteUser,
    updateUser
}