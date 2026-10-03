/**
 * cardapio.js
 * Lógica para a página do cardápio: carregar categorias, produtos e fazer pedidos.
 */

document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();
    carregarProdutos();

    // Event listeners
    document.getElementById('tipoEntrega').addEventListener('change', (e) => {
        const enderecoContainer = document.getElementById('enderecoContainer');
        const enderecoInput = document.getElementById('endereco');
        
        if (e.target.value === 'RETIRADA') {
            enderecoContainer.style.display = 'none';
            enderecoInput.removeAttribute('required');
        } else {
            enderecoContainer.style.display = 'block';
            enderecoInput.setAttribute('required', 'required');
        }
    });

    document.getElementById('btnConfirmarPedido').addEventListener('click', enviarPedido);
});

async function carregarCategorias() {
    try {
        const response = await window.api.getCategorias();
        // A API de categorias retorna paginação (depende da implementação do backend, se for Spring Data REST)
        // Assumindo que a resposta venha no formato { content: [...] } ou diretamente a lista [...]
        const categorias = response.content || response; 

        const categoriasContainer = document.getElementById('categorias-list');
        categoriasContainer.innerHTML = '';

        if (categorias.length === 0) {
            categoriasContainer.innerHTML = '<p class="text-muted">Nenhuma categoria encontrada.</p>';
            return;
        }

        // Adiciona a opção 'Todas'
        const btnTodos = document.createElement('button');
        btnTodos.className = 'list-group-item list-group-item-action active';
        btnTodos.textContent = 'Todas';
        btnTodos.onclick = (e) => filtrarPorCategoria('Todas', e.target);
        categoriasContainer.appendChild(btnTodos);

        categorias.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'list-group-item list-group-item-action';
            btn.textContent = cat.nome;
            btn.onclick = (e) => filtrarPorCategoria(cat.id, e.target);
            categoriasContainer.appendChild(btn);
        });

    } catch (error) {
        mostrarAlerta('Erro ao carregar categorias. Verifique se o servidor está rodando.', 'danger');
    }
}

async function carregarProdutos() {
    try {
        const response = await window.api.getProdutos();
        const produtos = response.content || response; // Compatível com paginação ou lista simples
        
        // Salva na memória para o filtro local
        window.produtosCarregados = produtos;
        
        renderizarProdutos(produtos);
    } catch (error) {
        mostrarAlerta('Erro ao carregar produtos. Verifique se o servidor está rodando.', 'danger');
        document.getElementById('produtos-list').innerHTML = '<div class="col-12"><p class="text-center text-muted">Não foi possível carregar o cardápio no momento.</p></div>';
    }
}

function renderizarProdutos(produtos) {
    const produtosContainer = document.getElementById('produtos-list');
    produtosContainer.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        produtosContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted">Nenhum produto encontrado.</p></div>';
        return;
    }

    produtos.forEach(prod => {
        const precoFormatado = prod.preco ? parseFloat(prod.preco).toFixed(2).replace('.', ',') : '0,00';
        // Imagem placeholder padrão, caso não tenha imagem
        const imgUrl = prod.imagem || 'https://via.placeholder.com/300x200?text=Sem+Imagem';

        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
            <div class="card card-custom h-100">
                <img src="${imgUrl}" class="card-img-top" alt="${prod.nome}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold">${prod.nome}</h5>
                    <p class="card-text text-muted small flex-grow-1">${prod.descricao || 'Sem descrição'}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="fs-5 fw-bold text-success">R$ ${precoFormatado}</span>
                        <button class="btn btn-sm btn-outline-danger" onclick="abrirModalPedido('${prod.id}', '${prod.nome}', ${prod.preco})">
                            Pedir
                        </button>
                    </div>
                </div>
            </div>
        `;
        produtosContainer.appendChild(card);
    });
}

function filtrarPorCategoria(categoriaId, btnElement) {
    // Atualiza a interface
    document.querySelectorAll('#categorias-list .list-group-item').forEach(el => el.classList.remove('active'));
    btnElement.classList.add('active');

    if (!window.produtosCarregados) return;

    if (categoriaId === 'Todas') {
        renderizarProdutos(window.produtosCarregados);
    } else {
        const filtrados = window.produtosCarregados.filter(p => p.idCategoria === categoriaId);
        renderizarProdutos(filtrados);
    }
}

function abrirModalPedido(id, nome, preco) {
    document.getElementById('pedido-produto-id').value = id;
    document.getElementById('pedido-produto-nome').textContent = nome;
    document.getElementById('pedido-preco').value = preco;
    document.getElementById('pedido-produto-valor').textContent = parseFloat(preco).toFixed(2).replace('.', ',');
    
    // Limpar o form
    document.getElementById('pedidoForm').reset();
    document.getElementById('enderecoContainer').style.display = 'block';

    const modal = new bootstrap.Modal(document.getElementById('pedidoModal'));
    modal.show();
}

async function enviarPedido() {
    const form = document.getElementById('pedidoForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const idCliente = document.getElementById('clienteId').value;
    const precoTotal = parseFloat(document.getElementById('pedido-preco').value);
    const tipoEntrega = document.getElementById('tipoEntrega').value;
    const endereco = document.getElementById('endereco').value;
    const telefone = document.getElementById('telefone').value;
    const formaPagamento = document.getElementById('formaPagamento').value;

    const btn = document.getElementById('btnConfirmarPedido');
    const txtOriginal = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processando...';
    btn.disabled = true;

    try {
        // Objeto conforme a especificação do backend
        const novoPedido = {
            idCliente: idCliente,
            precoTotal: precoTotal,
            tipoEntrega: tipoEntrega,
            endereco: tipoEntrega === 'DELIVERY' ? endereco : null,
            formaPagamento: formaPagamento,
            telefone: telefone
        };

        await window.api.createPedido(novoPedido);
        
        // Fechar modal
        bootstrap.Modal.getInstance(document.getElementById('pedidoModal')).hide();
        
        // Mostrar sucesso
        mostrarAlerta('Pedido realizado com sucesso! Em breve entraremos em contato.', 'success');
        
    } catch (error) {
        mostrarAlerta('Erro ao realizar o pedido. Tente novamente.', 'danger');
    } finally {
        btn.innerHTML = txtOriginal;
        btn.disabled = false;
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
    
    // Auto fechar após 5 segundos
    setTimeout(() => {
        const alert = bootstrap.Alert.getInstance(document.querySelector('.alert'));
        if (alert) alert.close();
    }, 5000);
}
