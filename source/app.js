const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database('Campanhas.db');
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Gera um Código de ID personalizado para a nova campanha
function gerarCodigo(plataforma, nomeNegocio, ultimoCodigo) {
    const prefixo = "C" + plataforma[0].toUpperCase() + nomeNegocio[0].toUpperCase();

    let numero = 1;

    if (ultimoCodigo && ultimoCodigo.includes("-")) {
        const partes = ultimoCodigo.split("-");
        numero = parseInt(partes[1]) + 1
    }

    return `${prefixo}-${String(numero).padStart(3, "0")}`;
}

// Endpoint: Obter detalhes de todas as campanhas
app.get("/Campanhas", (req, res) => {
    db.all(`
        SELECT * FROM CampanhasImpulsionamento;
    `, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Endpoint: Criar nova campanha
app.post("/Campanhas", (req, res) => {
    const {
        NomeCampanha,
        Plataforma,
        Duracao,
        DataComeco,
        DataFim,
        CustoPorDia,
        ISS,
        PIS,
        NomeNegocio
    } = req.body;

    const prefixo = "C" + Plataforma[0].toUpperCase() + NomeNegocio[0].toUpperCase();

    const buscarUltimo = `
        SELECT CodigoCampanha
        FROM CampanhasImpulsionamento
        WHERE CodigoCampanha LIKE ?
        ORDER BY CAST(SUBSTR(CodigoCampanha, -3) AS INTEGER) DESC
        LIMIT 1
    `;

    db.get(
        buscarUltimo,
        [`${prefixo}-%`],

        (err, row) => {
            if (err) {
                return res.status(500).json({error: err.message});
            }

            const codigo = gerarCodigo(Plataforma, NomeNegocio, row?.CodigoCampanha);

            const sql = `
                INSERT INTO CampanhasImpulsionamento (
                    CampanhaNome,
                    Plataforma,
                    CampanhaDuracao,
                    DataComeco,
                    DataFim,
                    CustoPorDia,
                    ISS,
                    PIS,
                    NomeNegocio,
                    CodigoCampanha
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const valores = [
                NomeCampanha,
                Plataforma,
                Duracao,
                DataComeco,
                DataFim,
                CustoPorDia,
                ISS,
                PIS,
                NomeNegocio,
                codigo
            ];

            db.run(sql, valores, function(err) {
                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.status(201).json({
                    mensagem: "Campanha criada com sucesso",
                    id: this.lastID
                });
            });
        }
    );
});

// Endpoint: Obter detalhes diários da campanha
app.get("/Campanhas/:id/detalhes", (req, res) => {
    // Extrair ID da URL
    const id = req.params.id;

    const sql = `
        SELECT c.CampanhaNome, d.ID, d.Dia, d.Data, d.AlcanceTotal, d.VisualizacoesTotal, d.VisitasAPagina, d.VisitasAWebSite
        FROM CampanhasImpulsionamento AS c
        JOIN DetalhesCampanha AS d ON c.ID = d.IDCampanha
        WHERE c.ID = ?;
    `;

    db.all(sql, [id], (err,rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
}); 

app.listen(3000, () => {
  console.log(`API running on http://localhost:${port}`);
});