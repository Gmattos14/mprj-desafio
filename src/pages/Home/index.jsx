import { useState, useEffect } from "react";
import "./style.css";

class CompraDireta {
  constructor(anoProcesso, municipio, valorTotalCompra, enquadramentoLegal, fornecedor, objeto) {
    this.anoProcesso = anoProcesso;
    this.municipio = municipio;
    this.valorTotalCompra = valorTotalCompra;
    this.enquadramentoLegal = enquadramentoLegal;
    this.fornecedor = fornecedor;
    this.objeto = objeto;
  }
}

const Home = () => {
  const [dados, setDados] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [limite, setLimite] = useState(100);
  const [ordenacao, setOrdenacao] = useState({ coluna: null, asc: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/compra", {
          method: "GET",
          mode: "cors"
        });

        if (!response.ok) {
          throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const compras = Array.isArray(data.Compras) ? data.Compras.map(item => new CompraDireta(
          item.AnoProcesso,
          item.Municipio,
          item.ValorTotalCompra,
          item.EnquadramentoLegal,
          item.Fornecedor,
          item.Objeto
        )) : [];

        setDados(compras);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setLimite(prevLimite => prevLimite + 10);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ordenarPorColuna = (coluna) => {
    setOrdenacao(prev => ({
      coluna,
      asc: prev.coluna === coluna ? !prev.asc : true,
    }));
  };

  const dadosFiltradosOrdenados = [...dados]
    .filter(compra => compra.municipio.toLowerCase().includes(filtro.toLowerCase()))
    .slice(0, limite)
    .sort((a, b) => {
      if (!ordenacao.coluna) return 0;
      const valorA = a[ordenacao.coluna];
      const valorB = b[ordenacao.coluna];

      if (typeof valorA === "string") {
        return ordenacao.asc ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
      } else {
        return ordenacao.asc ? valorA - valorB : valorB - valorA;
      }
    });

  const obterIconeOrdenacao = (coluna) => {
    if (ordenacao.coluna !== coluna) return "";
    return ordenacao.asc ? " 🔼" : " 🔽";
  };

  return (
    <div className="table-container">
      <h1>Compras Diretas por Município</h1>
      <input 
        type="text" 
        placeholder="Filtrar por município..." 
        value={filtro} 
        onChange={(e) => setFiltro(e.target.value)}
      />

      {carregando ? (
        <p>Carregando dados...</p>
      ) : erro ? (
        <p className="error-message">Erro ao carregar os dados: {erro}</p>
      ) : (
        dadosFiltradosOrdenados.length > 0 ? (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th onClick={() => ordenarPorColuna("anoProcesso")}>
                    Ano do Processo {obterIconeOrdenacao("anoProcesso")}
                  </th>
                  <th onClick={() => ordenarPorColuna("municipio")}>
                    Município {obterIconeOrdenacao("municipio")}
                  </th>
                  <th onClick={() => ordenarPorColuna("fornecedor")}>
                    Fornecedor {obterIconeOrdenacao("fornecedor")}
                  </th>
                  <th onClick={() => ordenarPorColuna("objeto")}>
                    Objeto {obterIconeOrdenacao("objeto")}
                  </th>
                  <th onClick={() => ordenarPorColuna("valorTotalCompra")}>
                    Valor Total {obterIconeOrdenacao("valorTotalCompra")}
                  </th>
                  <th onClick={() => ordenarPorColuna("enquadramentoLegal")}>
                    Enquadramento Legal {obterIconeOrdenacao("enquadramentoLegal")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltradosOrdenados.map((compra, index) => (
                  <tr key={index}>
                    <td>{compra.anoProcesso}</td>
                    <td>{compra.municipio}</td>
                    <td>{compra.fornecedor}</td>
                    <td>{compra.objeto}</td>
                    <td>R$ {Number(compra.valorTotalCompra).toFixed(2)}</td>
                    <td>{compra.enquadramentoLegal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Nenhum dado encontrado.</p>
        )
      )}
    </div>
  );
};

export default Home;