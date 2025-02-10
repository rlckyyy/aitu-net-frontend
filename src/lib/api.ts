const API_URL = 'http://localhost:8080/api';

async function request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        throw new Error("Ошибка API");
    }

    return res.json();
}

export const api = {
    register: (username: string, email: string, password: string) =>
        request("/v1/auth/register", {
            method: "POST",
            body: JSON.stringify({username, email, password}),
        }),

    login: async (email: string, password: string) => {
        const data = await request("/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({email, password}),
        });

        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        return data;
    },

    getUser: () => request("/v1/users/me", {
        method: "GET"
    }),

    logout: () => {
        localStorage.removeItem("token");
    },
};