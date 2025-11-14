// API Endpoints
const API_AUTH_URL = 'http://localhost:5184/api/Auth'; // Ajuste a porta se necessário

// Formulário de Login
const formLogin = document.getElementById('form-login');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

// Formulário de Registo
const formRegister = document.getElementById('form-register');
const registerUsername = document.getElementById('register-username');
const registerPassword = document.getElementById('register-password');
const registerError = document.getElementById('register-error');

/**
 * Redireciona para o dashboard
 */
function irParaDashboard() {
    // --- CORREÇÃO (INÍCIO) ---
    // Adicionamos um pequeno atraso (100ms) antes de redirecionar.
    // Isto dá tempo ao navegador para processar o Set-Cookie que acabou de
    // receber do pedido de login/registo, resolvendo a "race condition"
    // em que o dashboard.js tentava fazer fetch antes de o cookie estar pronto.
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 100); 
    // --- CORREÇÃO (FIM) ---
}

/**
 * Lógica do formulário de Login
 */
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    registerError.style.display = 'none'; // Limpa o outro erro

    const authRequest = {
        nomeUsuario: loginUsername.value,
        senha: loginPassword.value
    };

    try {
        const response = await fetch(`${API_AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authRequest),
            credentials: 'include'
        });

        if (response.ok) {
            irParaDashboard(); // Sucesso
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Falha no login.');
        }
    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    }
});

/**
 * Lógica do formulário de Registo
 */
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.style.display = 'none';
    loginError.style.display = 'none'; // Limpa o outro erro

    const authRequest = {
        nomeUsuario: registerUsername.value,
        senha: registerPassword.value
    };

    // Validação do front-end
    if (authRequest.nomeUsuario.length < 4 || authRequest.senha.length < 4) {
        registerError.textContent = 'Nome de utilizador e senha devem ter pelo menos 4 caracteres.';
        registerError.style.display = 'block';
        return;
    }

    try {
        // Apenas um pedido. O backend vai registar E fazer o login.
        const response = await fetch(`${API_AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authRequest),
            credentials: 'include'
        });

        if (response.ok) {
            // Se o registo foi OK, o cookie foi criado. Vamos para o dashboard.
            irParaDashboard();
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Falha no registo.');
        }
    } catch (error) {
        // Mostra o erro no formulário de registo
        registerError.textContent = error.message;
        registerError.style.display = 'block';
    }
});