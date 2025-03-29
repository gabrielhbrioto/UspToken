import React, { createContext, useState } from "react";

// Criando o contexto
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(sessionStorage.getItem('token') || null);

    // Função para buscar o token do localStorage
    const getAccessToken = () => {
        const tokenStr = sessionStorage.getItem('token');
        const token = JSON.parse(tokenStr);
        return token;
    }

    // Função para renovar o token
    const refreshAccessToken = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_BASE_URL + "/refresh-token", {
                method: "POST",
                credentials: "include" // Necessário para enviar cookies HTTP-only
            });

            if (!response.ok) {
                console.error("Erro ao renovar o token");
                return false;
            }

            const data = await response.json();
            sessionStorage.setItem('token', JSON.stringify(data.token));
            setAccessToken(data.token);
            return true;
        } catch (error) {
            console.error("Erro ao tentar renovar token:", error);
            return false;
        }
    };

    // Função Fetch que renova automaticamente se o token expirar
    const fetchWithAuth = async (url, options = {}) => {
        options.headers = {
            ...options.headers,
            "Content-Type": "application/json",
            "x-access-token": getAccessToken() || ""
        };

        let response = await fetch(url, options);

        // Se o token expirou (erro 401), tenta renovar automaticamente
        if (response.status === 401) {
            console.warn("Token expirado, tentando renovar...");

            const refreshed = await refreshAccessToken();
            if (refreshed) {
                options.headers["x-access-token"] = getAccessToken();
                response = await fetch(url, options);
            }
        }

        return response;
    };

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken, fetchWithAuth, refreshAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
