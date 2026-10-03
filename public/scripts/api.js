/**
 * api.js
 * Módulo responsável pela comunicação com o backend da Cantina da Nonna.
 * Centraliza as URLs e configurações do Fetch API.
 */

const API_BASE_URL = 'http://localhost:8080';

/**
 * Função genérica para realizar requisições HTTP.
 * 
 * @param {string} endpoint - O caminho da API (ex: '/categorias').
 * @param {string} method - O método HTTP (GET, POST, PUT, DELETE).
 * @param {Object} [body=null] - O corpo da requisição (opcional).
 * @returns {Promise<any>} - A resposta em formato JSON.
 */
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Retorna status 204 (No Content) com sucesso sem tentar parsear JSON
        if (response.status === 204) {
            return { success: true };
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `Erro HTTP: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`Erro na requisição ${method} ${endpoint}:`, error);
        throw error;
    }
}

// Exportando as funções para o escopo global (idealmente usaríamos ES Modules, mas mantendo simples em vanilla sem bundlers)
window.api = {
    // Categorias
    getCategorias: (page = 0, size = 30) => fetchAPI(`/categorias?page=${page}&size=${size}`),
    createCategoria: (categoria) => fetchAPI('/categorias', 'POST', categoria),
    updateCategoria: (id, categoria) => fetchAPI(`/categorias/${id}`, 'PUT', categoria),
    deleteCategoria: (id) => fetchAPI(`/categorias/${id}`, 'DELETE'),

    // Produtos
    getProdutos: () => fetchAPI('/produtos'),
    getProduto: (id) => fetchAPI(`/produtos/${id}`),
    createProduto: (produto) => fetchAPI('/produtos', 'POST', produto),
    updateProduto: (id, produto) => fetchAPI(`/produtos/${id}`, 'PUT', produto),
    deleteProduto: (id) => fetchAPI(`/produtos/${id}`, 'DELETE'),

    // Pedidos
    getPedidos: () => fetchAPI('/pedidos'),
    getPedido: (id) => fetchAPI(`/pedidos/${id}`),
    createPedido: (pedido) => fetchAPI('/pedidos', 'POST', pedido),
    updatePedido: (id, dados) => fetchAPI(`/pedidos/${id}`, 'PUT', dados),
    cancelarPedido: (id, motivo) => fetchAPI(`/pedidos/${id}/cancelar`, 'POST', { motivo }),

    // Reservas
    createReserva: (reserva) => fetchAPI('/reserva', 'POST', reserva),
    cancelarReserva: (id, motivo) => fetchAPI(`/reserva/${id}/cancelar`, 'POST', { motivo })
};
