import express from "express";
import cors from "cors";
import axios from "axios";


const api = express();
api.use(cors());
api.get("/compra", async (req, res) => {
  try {
    const response = await axios.get("https://dados.tcerj.tc.br/api/v1/compras_diretas_municipio");

    console.log("Enviando dados ao frontend:", response.data); // Confirme se aparece no terminal
    
    res.json(response.data); // Retorna os dados para o React
  } catch (error) {
    console.error("Erro ao buscar dados:", error.message);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});
api.listen(3000, () => console.log("Servidor rodando na porta 3000"));

export default api