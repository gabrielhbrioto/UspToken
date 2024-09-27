CREATE TABLE USUARIOS(
    NUSP CHAR(8) NOT NULL,
    NOME VARCHAR(50) NOT NULL,
    EMAIL VARCHAR(50) NOT NULL,
    SENHA VARCHAR(20) NOT NULL,
    ENDERECO_ETHEREUM CHAR(42) NOT NULL,
    CARTEIRA JSONB NOT NULL,
    CONSTRAINT PK_USUARIOS PRIMARY KEY (NUSP),
    CONSTRAINT SK_USUARIO UNIQUE(ENDERECO_ETHEREUM),
    CONSTRAINT TK_USUARIOS UNIQUE(EMAIL)
);

CREATE TABLE BLACKLIST (
    id SERIAL PRIMARY KEY,
    TOKEN TEXT NOT NULL,
    EXPIRES_IN TIMESTAMP NOT NULL
);