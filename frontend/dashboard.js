// --- Configuração ---
const API_CORRIDAS_URL = 'http://localhost:5184/api/Corridas';
const API_AUTH_URL = 'http://localhost:5184/api/Auth';

let editMode = false;
let editId = null;

// --- Elementos do DOM ---
const form = document.getElementById('form-corrida');
const listaCorridas = document.getElementById('lista-corridas');
const loadingDiv = document.getElementById('loading');
const errorMessageDiv = document.getElementById('error-message');
// ... (inputs)
const inputData = document.getElementById('data');
const inputDistancia = document.getElementById('distancia');
const inputTempo = document.getElementById('tempo');
const inputLocal = document.getElementById('local');
// ... (botões)
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const btnRandom = document.getElementById('btn-random');
const btnLogout = document.getElementById('btn-logout'); // <-- NOVO

// --- Funções Auxiliares ---

function showError(message) {
    errorMessageDiv.textContent = `Erro: ${message}.`;
    errorMessageDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
}

function clearError() {
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
}

// ... (Funções formatarData, calcularPace, resetFormToCreateMode, preencherComDadosAleatorios não mudam) ...
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleString('pt-PT', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
}

function calcularPace(distancia, tempo) {
    if (distancia <= 0 || tempo <= 0) return "N/A";
    const paceDecimal = tempo / distancia;
    const paceMinutos = Math.floor(paceDecimal);
    const paceSegundos = Math.round((paceDecimal - paceMinutos) * 60);
    const segundosFormatados = paceSegundos.toString().padStart(2, '0');
    return `${paceMinutos}:${segundosFormatados} min/km`;
}

function resetFormToCreateMode() {
    form.reset();
    editMode = false;
    editId = null;
    btnSalvar.textContent = 'Guardar Corrida';
    btnSalvar.style.backgroundColor = 'var(--cor-destaque)';
    btnCancelar.style.display = 'none';
}

function preencherComDadosAleatorios() {
    resetFormToCreateMode();
    const locais = ["Parque Ibirapuera", "Praia de Copacabana", "Avenida Paulista", "Centro da Cidade", "Volta no Quarteirão"];
    const distancia = (Math.random() * 20 + 1).toFixed(2);
    const tempo = Math.floor(Math.random() * 120 + 20);
    const local = locais[Math.floor(Math.random() * locais.length)];
    const agora = new Date();
    const dataParaInput = new Date(agora.getTime() - (agora.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    inputData.value = dataParaInput;
    inputDistancia.value = distancia;
    inputTempo.value = tempo;
    inputLocal.value = local;
}

// --- Lógica da Aplicação (Consumo da API) ---

/**
 * "Guarda de Rota" - Se não estiver logado, expulsa para o login
 */
function verificarLogin(error) {
    // O backend devolveu 401 (Unauthorized)
    if (error.message.includes('401')) {
        window.location.href = 'login.html'; // Expulsa!
    } else {
        console.error('Erro ao buscar corridas:', error);
        showError(error.message);
    }
}

async function fetchCorridas() {
    clearError();
    loadingDiv.style.display = 'block';
    listaCorridas.innerHTML = ''; 

    try {
        const response = await fetch(API_CORRIDAS_URL, {
            credentials: 'include' // <-- OBRIGATÓRIO
        });
        if (response.status === 401) throw new Error('401'); // Não autorizado
        if (!response.ok) throw new Error(`Falha na rede: ${response.statusText}`);

        const corridas = await response.json();
        renderCorridas(corridas);
    } catch (error) {
        verificarLogin(error); // Chama a "Guarda de Rota"
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// ... (Função renderCorridas não muda) ...
function renderCorridas(corridas) {
    if (corridas.length === 0) {
        listaCorridas.innerHTML = '<p style="text-align:center;">Nenhuma corrida registada ainda.</p>';
        return;
    }
    corridas.sort((a, b) => new Date(b.data) - new Date(a.data));
    corridas.forEach(corrida => {
        const item = document.createElement('li');
        item.className = 'corrida-item';
        const pace = calcularPace(corrida.distanciaKm, corrida.tempoMinutos);
        item.innerHTML = `
            <div class="corrida-info">
                <strong>${formatarData(corrida.data)}</strong>
                <p>${corrida.local || 'Local não informado'}</p>
            </div>
            <div class="corrida-stats">
                <span>${corrida.distanciaKm.toFixed(2)} km</span> / 
                <span>${corrida.tempoMinutos} min</span>
                <p class="pace">Pace: ${pace}</p>
            </div>
            <div class="corrida-acoes">
                <button class="btn-editar" data-id="${corrida.id}">Editar</button>
                <button class="btn-excluir" data-id="${corrida.id}">Excluir</button>
            </div>
        `;
        listaCorridas.appendChild(item);
    });
}

async function handleFormSubmit(event) {
    event.preventDefault(); 
    clearError();
    // ... (lógica de criar corridaData não muda)
    const corridaData = {
        data: inputData.value,
        distanciaKm: parseFloat(inputDistancia.value),
        tempoMinutos: parseInt(inputTempo.value, 10),
        local: inputLocal.value || null
    };

    if (editMode) {
        // --- Lógica de ATUALIZAÇÃO (UPDATE) ---
        try {
            const corridaAtualizada = { ...corridaData, id: editId }; 
            const response = await fetch(`${API_CORRIDAS_URL}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corridaAtualizada),
                credentials: 'include' // <-- OBRIGATÓRIO
            });
            if (response.status === 401) throw new Error('401');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.title || 'Erro ao salvar alterações');
            }
            resetFormToCreateMode();
            await fetchCorridas();
        } catch (error) {
            verificarLogin(error);
        }
    } else {
        // --- Lógica de CRIAÇÃO (CREATE) ---
        try {
            const response = await fetch(API_CORRIDAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corridaData),
                credentials: 'include' // <-- OBRIGATÓRIO
            });
            if (response.status === 401) throw new Error('401');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.title || errorData || 'Erro ao guardar corrida');
            }
            form.reset();
            await fetchCorridas();
        } catch (error) {
            verificarLogin(error);
        }
    }
}

async function handleDeleteClick(id) {
    clearError();
    if (!confirm('Tem a certeza que deseja eliminar esta corrida?')) return;

    try {
        const response = await fetch(`${API_CORRIDAS_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include' // <-- OBRIGATÓRIO
        });
        if (response.status === 401) throw new Error('401');
        if (!response.ok) throw new Error('Falha ao eliminar a corrida.');
        await fetchCorridas();
    } catch (error) {
        verificarLogin(error);
    }
}

async function handleEditClick(id) {
    clearError();
    try {
        const response = await fetch(`${API_CORRIDAS_URL}/${id}`, {
            credentials: 'include' // <-- OBRIGATÓRIO
        });
        if (response.status === 401) throw new Error('401');
        if (!response.ok) throw new Error('Falha ao buscar dados para edição.');

        const corrida = await response.json();
        // ... (lógica de preencher formulário não muda)
        const dataLocal = new Date(corrida.data);
        const dataParaInput = new Date(dataLocal.getTime() - (dataLocal.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        inputData.value = dataParaInput;
        inputDistancia.value = corrida.distanciaKm;
        inputTempo.value = corrida.tempoMinutos;
        inputLocal.value = corrida.local;
        editMode = true;
        editId = corrida.id;
        btnSalvar.textContent = 'Salvar Alterações';
        btnSalvar.style.backgroundColor = '#FFB800';
        btnCancelar.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        verificarLogin(error);
    }
}

// ... (Função handleListClick não muda) ...
async function handleListClick(event) {
    if (event.target.classList.contains('btn-excluir')) {
        const id = event.target.dataset.id;
        await handleDeleteClick(id);
    }
    if (event.target.classList.contains('btn-editar')) {
        const id = event.target.dataset.id;
        await handleEditClick(id);
    }
}

/**
 * Lógica de Logout
 */
btnLogout.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        await fetch(`${API_AUTH_URL}/logout`, {
            method: 'POST',
            credentials: 'include' // <-- OBRIGATÓRIO
        });
    } catch (error) {
        console.error('Erro no logout:', error);
    } finally {
        // Expulsa para o login, quer o pedido falhe ou não
        window.location.href = 'login.html';
    }
});

// --- Inicialização ---
form.addEventListener('submit', handleFormSubmit);
listaCorridas.addEventListener('click', handleListClick);
btnCancelar.addEventListener('click', resetFormToCreateMode);
btnRandom.addEventListener('click', preencherComDadosAleatorios);

// Carrega os dados iniciais (e verifica o login)
document.addEventListener('DOMContentLoaded', () => {
    fetchCorridas();
    resetFormToCreateMode();
});