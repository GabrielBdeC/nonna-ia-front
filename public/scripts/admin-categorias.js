/**
 * admin-categorias.js
 * Gerenciamento de categorias.
 */

document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();

    document.getElementById('btnSalvarCategoria').addEventListener('click', salvarCategoria);
});

async function carregarCategorias() {
    const tbody = document.getElementById('categorias-tbody');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Carregando...</td></tr>';

    try {
        const response = await window.api.getCategorias();
        const categorias = response.content || response;
        
        tbody.innerHTML = '';

        if (!categorias || categorias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Nenhuma categoria encontrada.</td></tr>';
            return;
        }

        categorias.forEach(cat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-muted small">${cat.id}</td>
                <td class="fw-bold">${cat.nome}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary me-2" onclick="editarCategoria('${cat.id}', '${cat.nome}')">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirCategoria('${cat.id}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        mostrarAlerta('Erro ao carregar categorias.', 'danger');
    }
}

function abrirModalCategoria() {
    document.getElementById('categoriaForm').reset();
    document.getElementById('categoria-id').value = '';
    document.getElementById('modalTitle').textContent = 'Nova Categoria';
    new bootstrap.Modal(document.getElementById('categoriaModal')).show();
}

function editarCategoria(id, nome) {
    document.getElementById('categoria-id').value = id;
    document.getElementById('nomeCategoria').value = nome;
    document.getElementById('modalTitle').textContent = 'Editar Categoria';
    new bootstrap.Modal(document.getElementById('categoriaModal')).show();
}

async function salvarCategoria() {
    const id = document.getElementById('categoria-id').value;
    const nome = document.getElementById('nomeCategoria').value;
    const btn = document.getElementById('btnSalvarCategoria');

    if (!nome) {
        alert('O nome é obrigatório');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = 'Salvando...';

    try {
        if (id) {
            await window.api.updateCategoria(id, { nome: nome });
            mostrarAlerta('Categoria atualizada com sucesso.', 'success');
        } else {
            await window.api.createCategoria({ nome: nome });
            mostrarAlerta('Categoria criada com sucesso.', 'success');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('categoriaModal')).hide();
        carregarCategorias();
    } catch (error) {
        mostrarAlerta('Erro ao salvar categoria.', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Salvar';
    }
}

async function excluirCategoria(id) {
    if (!confirm('Atenção: excluir uma categoria pode afetar os produtos vinculados. Deseja continuar?')) return;

    try {
        await window.api.deleteCategoria(id);
        mostrarAlerta('Categoria excluída com sucesso.', 'success');
        carregarCategorias();
    } catch (error) {
        mostrarAlerta('Erro ao excluir categoria.', 'danger');
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
