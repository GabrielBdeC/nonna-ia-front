/**
 * admin-produtos.js
 * Gerenciamento de produtos.
 */

let categoriasCache = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarCategoriasParaSelect();
    carregarProdutos();

    document.getElementById('btnSalvarProduto').addEventListener('click', salvarProduto);
});

async function carregarCategoriasParaSelect() {
    try {
        const response = await window.api.getCategorias();
        categoriasCache = response.content || response;
        
        const select = document.getElementById('idCategoria');
        select.innerHTML = '<option value="">Selecione uma categoria</option>';
        
        categoriasCache.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias', error);
    }
}

async function carregarProdutos() {
    const container = document.getElementById('produtos-grid');
    container.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-danger" role="status"></div></div>';

    try {
        const response = await window.api.getProdutos();
        const produtos = response.content || response;
        
        container.innerHTML = '';

        if (!produtos || produtos.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center text-muted">Nenhum produto cadastrado.</p></div>';
            return;
        }

        produtos.forEach(prod => {
            const imgUrl = prod.imagem || 'https://via.placeholder.com/300x200?text=Sem+Imagem';
            
            // Encontra o nome da categoria usando o cache
            const categoria = categoriasCache.find(c => c.id === prod.idCategoria);
            const nomeCategoria = categoria ? categoria.nome : 'Desconhecida';

            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';
            card.innerHTML = `
                <div class="card h-100 shadow-sm border-0">
                    <img src="${imgUrl}" class="card-img-top" style="height: 180px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">${prod.nome}</h5>
                            <span class="badge bg-secondary">${nomeCategoria}</span>
                        </div>
                        <p class="card-text text-muted small flex-grow-1">${prod.descricao || 'Sem descrição'}</p>
                        <h5 class="text-success fw-bold">R$ ${parseFloat(prod.preco).toFixed(2).replace('.', ',')}</h5>
                    </div>
                    <div class="card-footer bg-white border-top-0 d-flex justify-content-end pb-3">
                        <button class="btn btn-sm btn-outline-secondary me-2" onclick='editarProduto(${JSON.stringify(prod).replace(/'/g, "&#39;")})'>Editar</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="excluirProduto('${prod.id}')">Excluir</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        mostrarAlerta('Erro ao carregar produtos.', 'danger');
        container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Falha ao carregar dados.</p></div>';
    }
}

function abrirModalProduto() {
    document.getElementById('produtoForm').reset();
    document.getElementById('produto-id').value = '';
    document.getElementById('modalTitle').textContent = 'Novo Produto';
    new bootstrap.Modal(document.getElementById('produtoModal')).show();
}

function editarProduto(produto) {
    document.getElementById('produto-id').value = produto.id;
    document.getElementById('nome').value = produto.nome;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('descricao').value = produto.descricao || '';
    document.getElementById('idCategoria').value = produto.idCategoria;
    document.getElementById('imagem').value = produto.imagem || '';
    
    document.getElementById('modalTitle').textContent = 'Editar Produto';
    new bootstrap.Modal(document.getElementById('produtoModal')).show();
}

async function salvarProduto() {
    const form = document.getElementById('produtoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('produto-id').value;
    const produto = {
        nome: document.getElementById('nome').value,
        preco: parseFloat(document.getElementById('preco').value),
        descricao: document.getElementById('descricao').value,
        idCategoria: document.getElementById('idCategoria').value,
        imagem: document.getElementById('imagem').value || null
    };

    const btn = document.getElementById('btnSalvarProduto');
    btn.disabled = true;
    btn.innerHTML = 'Salvando...';

    try {
        if (id) {
            await window.api.updateProduto(id, produto);
            mostrarAlerta('Produto atualizado com sucesso.', 'success');
        } else {
            await window.api.createProduto(produto);
            mostrarAlerta('Produto criado com sucesso.', 'success');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('produtoModal')).hide();
        carregarProdutos();
    } catch (error) {
        mostrarAlerta('Erro ao salvar produto.', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Salvar';
    }
}

async function excluirProduto(id) {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
        await window.api.deleteProduto(id);
        mostrarAlerta('Produto excluído com sucesso.', 'success');
        carregarProdutos();
    } catch (error) {
        mostrarAlerta('Erro ao excluir produto.', 'danger');
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
    window.scrollTo(0, 0);
}
