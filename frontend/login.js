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


// Redireciona para o dashboard
function irParaDashboard() {
    // Aguarda um pouco para garantir que o cookie foi criado
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 100); 
}


// Lógica do formulário de Login
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    registerError.style.display = 'none';

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
            // Tratamento de Erro de Login
            const errorText = await response.text();
            let friendlyErrorMessage = 'Nome de utilizador ou senha inválidos.';

            try {
                const errorJson = JSON.parse(errorText);

                if (errorJson.title || errorJson.errors) {
                    friendlyErrorMessage = 'Nome de utilizador ou senha inválidos.';
                } else if (errorJson.message) {
                    friendlyErrorMessage = errorJson.message;
                }
            } catch (e) {
                if (errorText && errorText.length < 255) {
                    friendlyErrorMessage = errorText;
                }
            }

            throw new Error(friendlyErrorMessage);
        }
    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    }
});

// Lógica do formulário de Registo
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.style.display = 'none';
    loginError.style.display = 'none';

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
            let friendlyErrorMessage = 'Falha no registo. Por favor, verifique os seus dados.';

            // 1. Verificar se o erro é sobre o nome de utilizador já existir (Conflict)
            if (response.status === 409 || errorText.toLowerCase().includes('exists') || errorText.toLowerCase().includes('já existe') || errorText.toLowerCase().includes(authRequest.nomeUsuario.toLowerCase())) {
                friendlyErrorMessage = `O nome de utilizador "${authRequest.nomeUsuario}" já está registado. Por favor, escolha outro.`;
            }

            // 2. Tentar analisar o JSON para erros de validação (como senha curta)
            try {
                const errorJson = JSON.parse(errorText);

                if (errorJson.errors && errorJson.errors.Senha) {
                    // Erro de validação da senha
                    friendlyErrorMessage = errorJson.errors.Senha[0];
                } else if (errorJson.title) {
                    // Erro geral do Validation Problem
                    friendlyErrorMessage = errorJson.title;
                } else if (errorJson.message) {
                    // Outras APIs usam 'message' para erros
                    friendlyErrorMessage = errorJson.message;
                }
            } catch (e) {
                // Se a análise do JSON falhar, mantemos a mensagem mais amigável já definida.
            }
            
            throw new Error(friendlyErrorMessage);
        }
    } catch (error) {
        // Mostra o erro no formulário de registo
        registerError.textContent = error.message;
        registerError.style.display = 'block';
    }
});