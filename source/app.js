const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database('Campanhas.db');
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

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
        PIS
    } = req.body;

    const sql = `
        INSERT INTO CampanhasImpulsionamento (
            CampanhaNome,
            Plataforma,
            CampanhaDuracao,
            DataComeco,
            DataFim,
            CustoPorDia,
            ISS,
            PIS
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [NomeCampanha, Plataforma, Duracao, DataComeco, DataFim, CustoPorDia, ISS, PIS];

    db.run(sql, valores, function(err) {
        if (err) {
            res.status(500).json({
                error: err.message
            });
            return;
        }
        res.status(201).json({
            mensagem: "Campanha criada com sucesso",
            id: this.lastID
        });
    });
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