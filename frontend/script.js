// --- Configuração ---
// (Ajuste a porta para a sua API, ex: 5184)
const API_BASE_URL = 'http://localhost:5184/api/Corridas'; 

let editMode = false;
let editId = null;

// --- Elementos do DOM ---
const form = document.getElementById('form-corrida');
const listaCorridas = document.getElementById('lista-corridas');
const loadingDiv = document.getElementById('loading');
const errorMessageDiv = document.getElementById('error-message');

const inputData = document.getElementById('data');
const inputDistancia = document.getElementById('distancia');
const inputTempo = document.getElementById('tempo');
const inputLocal = document.getElementById('local');

const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');

const btnRandom = document.getElementById('btn-random');

// --- Funções Auxiliares ---

function showError(message) {
    errorMessageDiv.textContent = `Erro: ${message}. Verifique se a API está em execução em ${API_BASE_URL} e se o CORS está configurado.`;
    errorMessageDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
}

function clearError() {
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
}

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
    btnCancelar.style.display = 'none';
}

/**
 * Preenche o formulário com dados aleatórios para teste
 */
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

async function fetchCorridas() {
    clearError();
    loadingDiv.style.display = 'block';
    listaCorridas.innerHTML = ''; 

    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error(`Falha na rede: ${response.statusText}`);
        const corridas = await response.json();
        renderCorridas(corridas);
    } catch (error) {
        console.error('Erro ao buscar corridas:', error);
        showError(error.message);
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function renderCorridas(corridas) {
    if (corridas.length === 0) {
        listaCorridas.innerHTML = '<p style="text-align:center;">Nenhuma corrida registada ainda.</p>';
        return;
    }

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

    const corridaData = {
        data: inputData.value,
        distanciaKm: parseFloat(inputDistancia.value),
        tempoMinutos: parseInt(inputTempo.value, 10),
        local: inputLocal.value || null
    };

    if (editMode) {
        try {
            const corridaAtualizada = { ...corridaData, id: editId }; 
            const response = await fetch(`${API_BASE_URL}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corridaAtualizada),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.title || 'Erro ao salvar alterações');
            }
            resetFormToCreateMode();
            await fetchCorridas(); 
        } catch (error) {
            console.error('Erro ao atualizar corrida:', error);
            showError(error.message);
        }

    } else {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corridaData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.title || errorData || 'Erro ao guardar corrida');
            }
            form.reset();
            await fetchCorridas(); 
        } catch (error) {
            console.error('Erro ao guardar corrida:', error);
            showError(error.message);
        }
    }
}

async function handleDeleteClick(id) {
    clearError();
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Falha ao eliminar a corrida.');
        await fetchCorridas(); 
    } catch (error) {
        console.error('Erro ao eliminar:', error);
        showError(error.message);
    }
}

async function handleEditClick(id) {
    clearError();
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Falha ao buscar dados para edição.');
        const corrida = await response.json();

        const dataLocal = new Date(corrida.data);
        const dataParaInput = new Date(dataLocal.getTime() - (dataLocal.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        
        inputData.value = dataParaInput;
        inputDistancia.value = corrida.distanciaKm;
        inputTempo.value = corrida.tempoMinutos;
        inputLocal.value = corrida.local;

        editMode = true;
        editId = corrida.id;
        btnSalvar.textContent = 'Salvar Alterações';
        btnCancelar.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    
    } catch (error) {
        console.error('Erro ao preparar edição:', error);
        showError(error.message);
    }
}

async function handleListClick(event) {
    if (event.target.classList.contains('btn-excluir')) {
        const id = event.target.dataset.id;
        if (confirm('Tem a certeza que deseja eliminar esta corrida?')) {
            await handleDeleteClick(id);
        }
    }
    if (event.target.classList.contains('btn-editar')) {
        const id = event.target.dataset.id;
        await handleEditClick(id);
    }
}

// --- Inicialização ---
form.addEventListener('submit', handleFormSubmit);
listaCorridas.addEventListener('click', handleListClick);
btnCancelar.addEventListener('click', resetFormToCreateMode);
btnRandom.addEventListener('click', preencherComDadosAleatorios);

document.addEventListener('DOMContentLoaded', () => {
    fetchCorridas();
    resetFormToCreateMode();
});