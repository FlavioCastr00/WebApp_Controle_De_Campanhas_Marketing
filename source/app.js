const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database('Campanhas.db');
const port = 3000;

app.use(express.static('public'));

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