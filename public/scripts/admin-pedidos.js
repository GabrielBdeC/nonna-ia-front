/**
 * admin-pedidos.js
 * Lógica da tela de gerenciamento de pedidos (Admin).
 */

document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();

    document.getElementById('btnSalvarStatus').addEventListener('click', salvarStatus);
});

async function carregarPedidos() {
    const tbody = document.getElementById('pedidos-tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-danger" role="status"></div>
            </td>
        </tr>`;

    try {
        const response = await window.api.getPedidos();
        const pedidos = response.content || response;
        
        tbody.innerHTML = '';

        if (!pedidos || pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            
            // Formatando o status para uma badge bonita
            let badgeClass = 'bg-secondary';
            if (pedido.status === 'CONCLUIDO') badgeClass = 'bg-success';
            if (pedido.status === 'PREPARANDO') badgeClass = 'bg-warning text-dark';
            if (pedido.status === 'A_CAMINHO') badgeClass = 'bg-info text-dark';
            if (pedido.status === 'CANCELADO') badgeClass = 'bg-danger';

            tr.innerHTML = `
                <td class="fw-bold">#${pedido.id.substring(0, 8)}...</td>
                <td>${pedido.idCliente}</td>
                <td>R$ ${parseFloat(pedido.precoTotal).toFixed(2).replace('.', ',')}</td>
                <td>${pedido.tipoEntrega}</td>
                <td><span class="badge ${badgeClass}">${pedido.status || 'PENDENTE'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="abrirModalStatus('${pedido.id}')">
                        Status
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="cancelarPedido('${pedido.id}')">
                        Cancelar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        mostrarAlerta('Erro ao carregar pedidos.', 'danger');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Falha ao carregar dados.</td></tr>';
    }
}

function abrirModalStatus(id) {
    document.getElementById('pedido-id-atualizar').value = id;
    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    modal.show();
}

async function salvarStatus() {
    const id = document.getElementById('pedido-id-atualizar').value;
    const status = document.getElementById('novoStatus').value;
    const btn = document.getElementById('btnSalvarStatus');

    btn.disabled = true;
    btn.innerHTML = 'Salvando...';

    try {
        await window.api.updatePedido(id, { status: status });
        
        bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
        mostrarAlerta('Status atualizado com sucesso.', 'success');
        carregarPedidos(); // recarrega a lista
    } catch (error) {
        mostrarAlerta('Erro ao atualizar status.', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Salvar';
    }
}

async function cancelarPedido(id) {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;

    const motivo = prompt('Qual o motivo do cancelamento?');
    if (!motivo) return;

    try {
        await window.api.cancelarPedido(id, motivo);
        mostrarAlerta('Pedido cancelado com sucesso.', 'success');
        carregarPedidos();
    } catch (error) {
        mostrarAlerta('Erro ao cancelar pedido.', 'danger');
    }
}

function mostrarAlerta(mensagem, tipo) {
    const container = document.getElementById('alert-container');
    container.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}
