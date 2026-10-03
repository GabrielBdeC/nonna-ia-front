/**
 * reservas.js
 * Lógica para criar uma reserva no sistema.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Configura a data mínima para hoje
    const dateInput = document.getElementById('dataReserva');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    document.getElementById('reservaForm').addEventListener('submit', realizarReserva);
});

async function realizarReserva(event) {
    event.preventDefault(); // Evita reload da página

    const form = document.getElementById('reservaForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const idCliente = document.getElementById('clienteId').value;
    const data = document.getElementById('dataReserva').value;
    const hora = document.getElementById('horaReserva').value;
    const quantidadePessoas = parseInt(document.getElementById('quantidadePessoas').value);
    const tipoEvento = document.getElementById('tipoEvento').value;

    // Formatar data local com offset (ex: -03:00) para o backend processar a hora exata
    const dateObj = new Date(`${data}T${hora}:00`);
    const tzOffset = -dateObj.getTimezoneOffset();
    const dif = tzOffset >= 0 ? '+' : '-';
    const pad = (num) => String(Math.floor(Math.abs(num))).padStart(2, '0');
    const isoOffset = dif + pad(tzOffset / 60) + ':' + pad(tzOffset % 60);
    const datetimeIso = `${data}T${hora}:00${isoOffset}`;

    const btn = document.getElementById('btnReservar');
    const txtOriginal = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processando...';
    btn.disabled = true;

    try {
        const novaReserva = {
            idCliente: idCliente,
            horario: datetimeIso,
            quantidadePessoas: quantidadePessoas,
            tipoEvento: tipoEvento || null
        };

        await window.api.createReserva(novaReserva);
        
        mostrarAlerta('Reserva confirmada com sucesso! Te esperamos lá.', 'success');
        form.reset();
        
    } catch (error) {
        mostrarAlerta('Erro ao realizar a reserva. Verifique os dados e tente novamente.', 'danger');
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
        const alertNode = document.querySelector('.alert');
        if (alertNode) {
            const alert = bootstrap.Alert.getInstance(alertNode);
            if (alert) alert.close();
        }
    }, 5000);
}
