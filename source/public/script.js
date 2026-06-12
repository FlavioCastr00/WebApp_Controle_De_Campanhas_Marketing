carregarCampanhas();
const formulario = document.getElementById("formulario");

// Pegar eventos dos botões
document.addEventListener("click", (event) => {

    const addBtn = event.target.closest(".add-btn");
    const verMaisBtn = event.target.closest(".ver-mais-btn");
    const fecharBtn = event.target.closest(".fechar-btn");
    const editarBtn = event.target.closest(".editar-btn");
    const excluirBtn = event.target.closest(".excluir-btn");

    const modalAdd = document.getElementById("modal-add");
    const modalDetalhes = document.getElementById("modal-detalhes");
    const overlay = document.getElementById("modal-overlay");

    if (addBtn) {
        modalAdd.classList.remove("hide");
        overlay.classList.remove("hide");
        return;
    }

    if (verMaisBtn) {

        const id = verMaisBtn.dataset.id;

        modalDetalhes.classList.remove("hide");
        overlay.classList.remove("hide");

        CarregarDetalhes(id);

        return;
    }

    if (editarBtn) {

        const id = editarBtn.dataset.id;

        console.log("Editar campanha", id);

        return;
    }

    if (excluirBtn) {

        const id = excluirBtn.dataset.id;

        console.log("Excluir campanha", id);

        return;
    }

    if (fecharBtn || event.target.id === "modal-overlay") {

        modalAdd.classList.add("hide");
        modalDetalhes.classList.add("hide");
        overlay.classList.add("hide");

        return;
    }

});

// Processar dados do formulario e enviar
formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = document.getElementById("formulario");
    const modalAdd = document.getElementById("modal-add");
    const overlay = document.getElementById("modal-overlay");

    const nome = document.getElementById("nome-campanha").value;
    const plataforma = document.getElementById("plataforma").value;
    const dataComeco = document.getElementById("data-comeco").value;
    const dataFim = document.getElementById("data-fim").value;
    const custoPorDia = parseFloat(document.getElementById("custo-por-dia").value);
    const iss = parseFloat(document.getElementById("custo-iss").value);
    const pis = parseFloat(document.getElementById("custo-pis").value);
    const negocio = document.getElementById("nome-do-negocio").value;

    const inicio = new Date(dataComeco + "T00:00:00");
    const fim = new Date(dataFim + "T00:00:00");
    
    const diferencaMs = fim.getTime() - inicio.getTime();
    const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
    console.log(dias);

    //Validação dos Dados:
    if (nome === "") {
        alert("Preencha o nome da campanha");
        return;
    }

    if (nome.length > 100) {
        alert("Nome muito longo");
        return;
    }

    if (new Date(dataComeco) > new Date(dataFim)) {
        alert("A data de fim deve ser maior que a data de início");
        return;
    }

    if (isNaN(custoPorDia) || isNaN(iss) || isNaN(pis)) {
        alert("Valores inválidos");
        return;
    }

    if (custoPorDia < 0 || iss < 0 || pis < 0) {
        alert("Os valores não podem ser negativos");
        return;
    }

    // Preenchimento do Objeto
    const data = {
        NomeCampanha: nome,
        Plataforma: plataforma,
        Duracao: dias,
        DataComeco: dataComeco,
        DataFim: dataFim,
        CustoPorDia: custoPorDia,
        ISS: iss,
        PIS: pis,
        NomeNegocio: negocio
    }

    console.log(data);

    try {
        const resposta = await fetch("/Campanhas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!resposta.ok) {
            const erro = await resposta.text();
            throw new Error(erro);
        }

        const resultado = await resposta.json();
        console.log(resultado);
        
        alert("Campanha criada!");

        await carregarCampanhas();
    }
    catch (erro){
        console.error(erro);
        alert("Erro ao criar a campanha");
    }

    form.reset();
    modalAdd.classList.add("hide");
    overlay.classList.add("hide");
});

// Carregar Detalhes Diários da Campanha
async function CarregarDetalhes(id) {

    const response = await fetch(`/Campanhas/${id}/detalhes`);
    const detalhes = await response.json();

    console.log(detalhes);

    const campanhaNome = document.getElementById("campanha-nome");
    const tbody = document.getElementById("detalhes-tbody");

    campanhaNome.textContent = detalhes[0].CampanhaNome;
    tbody.innerHTML = "";

    detalhes.forEach(detalhe => {

        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${detalhe.Dia}</td>
            <td>${detalhe.Data}</td>
            <td>${detalhe.AlcanceTotal}</td>
            <td>${detalhe.VisualizacoesTotal}</td>
            <td>${detalhe.VisitasAPagina}</td>
            <td>${detalhe.VisitasAWebSite}</td>
        `;
        tbody.appendChild(linha);
    });
}

// Carregar campanhas ao abrir a página inicial
async function carregarCampanhas() {

    const response = await fetch('/Campanhas');
    const campanhas = await response.json();

    console.log(campanhas);

    // Elemento no qual a lista será gerada
    const lista = document.getElementById('lista-div');
    lista.innerHTML = "";

    campanhas.forEach(campanha => {
        const status = DefinirStatus(campanha.DataComeco, campanha.DataFim);
        const custoTotal = CalcularCustoTotal(campanha.CustoPorDia, campanha.CampanhaDuracao, campanha.ISS, campanha.PIS);

        const item = document.createElement('div');
        item.className = "campanha-card"

        // Inserir HTML no novo elemento
        item.innerHTML = `

            <div class="campanha-info">

                <h3>${campanha.CodigoCampanha}</h3>

                <p class="nome">
                    ${campanha.CampanhaNome}
                </p>

            </div>

            <p class="status ${status.classe}">
                ${status.texto}
            </p>

            <div class="campanha-resumo">

                <span>
                    📱 ${campanha.Plataforma}
                    •
                    ⏱ ${campanha.CampanhaDuracao} dias
                </span>

                <span>
                    📅 ${campanha.DataComeco}
                </span>

                <span class="custo-total">
                    💰 Total:
                    ${custoTotal}
                </span>

            </div>

            <div class="acoes">

                <button
                    class="ver-mais-btn"
                    data-id="${campanha.ID}">
                    Ver
                </button>

                <button
                    class="editar-btn"
                    data-id="${campanha.ID}">
                    Editar
                </button>

                <button
                    class="excluir-btn"
                    data-id="${campanha.ID}">
                    Excluir
                </button>

            </div>

        `;

        // Inserir novo elemento à lista
        lista.appendChild(item);
    });
}

function CalcularCustoTotal(custoDia, duracao, iss, pis) {
    return ((custoDia * duracao) + iss + pis).toLocaleString("pt-BR", {style: "currency", currency: "BRL"});
}

function DefinirStatus(dataComeco, dataFim) {
    const hoje = new Date();
    const inicio = new Date(dataComeco);
    const fim = new Date(dataFim);

    if (hoje < inicio)
    {
        return {
            texto: "Aguardando Inicio",
            classe: "status-aguardando"
        };
    }
    else if (hoje > inicio && hoje < fim)
    {
        return {
            texto: "Em Progresso",
            classe: "status-progresso"
        };
    }
    else
    {
        return {
            texto: "Finalizada",
            classe: "status-finalizada"
        };
    }
}