# Estado: Criação das Telas Iniciais

## O que foi modificado/criado
- `public/styles/style.css`: Criado com estilos globais, esquema de cores da marca e classes utilitárias baseadas no design limpo sugerido.
- `public/scripts/api.js`: Criada camada centralizada de comunicação HTTP (`fetch`) com a API Backend Rest (http://localhost:8080).
- `index.html`: Criada landing page do restaurante com links para as demais áreas.
- `cardapio.html` e `public/scripts/cardapio.js`: Criada listagem de produtos com filtro por categoria e integração com o endpoint de criação de pedidos.
- `reservas.html` e `public/scripts/reservas.js`: Criado formulário para realização de reservas usando o endpoint da API.
- `admin-pedidos.html` e `public/scripts/admin-pedidos.js`: Criado dashboard para visualização de pedidos e alteração de status/cancelamento.
- `admin-produtos.html` e `public/scripts/admin-produtos.js`: Criado CRUD completo de produtos consumindo a API.
- `admin-categorias.html` e `public/scripts/admin-categorias.js`: Criado CRUD completo de categorias consumindo a API.

## Decisões Tomadas
- O design foi inspirado na interface do Stitch, mantendo um visual limpo e moderno usando os utilitários do Bootstrap v5 (ex: sombras suaves, cantos arredondados e fontes modernas como a Inter).
- As requisições HTTP não utilizam bibliotecas externas (como Axios), adotando `fetch` nativo para aderir à regra de uso de Javascript Vanilla e manter o projeto didático.
- A área administrativa foi dividida em três páginas (`admin-pedidos`, `admin-produtos`, `admin-categorias`) com uma navegação comum entre elas, para facilitar a manutenção sem recorrer a frameworks SPA.
- O tratamento de IDs de clientes nos formulários públicos (`cardapio`, `reservas`) requer o ID manualmente, já que não há sistema de login/autenticação definido na OpenAPI neste momento.

## O que foi testado
- A estrutura das pastas e a organização do código seguem a arquitetura exigida e estão aptas para execução estática via Live Server ou similar.
- A consistência do layout responsivo com as classes do Bootstrap v5 foi validada estaticamente.
