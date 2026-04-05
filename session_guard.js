(function () {
  function obterProjeto() {
    const bruto = localStorage.getItem("projeto_lapidar");
    if (!bruto) return null;

    try {
      return JSON.parse(bruto);
    } catch (e) {
      return null;
    }
  }

  function nomePaginaAtual() {
    const caminho = window.location.pathname.split("/").pop();
    return caminho || "index.html";
  }

  function redirecionar(destino) {
    window.location.href = destino;
  }

  function protegerFluxo() {
    const projeto = obterProjeto();
    const pagina = nomePaginaAtual();

    const paginasLivres = [
      "index.html",
      "",
      "producao_integrada.html",
      "login.html"
    ];

    if (paginasLivres.includes(pagina)) {
      return;
    }

    if (!projeto) {
      redirecionar("producao_integrada.html");
      return;
    }

    const lapidacao = !!projeto.lapidacaoExecutada;
    const pagamento = !!projeto.pagamentoConfirmado;
    const download = !!projeto.downloadLiberado;
    const exportado = !!projeto.exportadoEm;

    if (pagina === "painel_projeto.html") {
      return;
    }

    if (pagina === "lapidacao_literaria.html") {
      return;
    }

    if (pagina === "pagamento.html" && !lapidacao) {
      redirecionar("painel_projeto.html");
      return;
    }

    if (pagina === "exportador_obra.html" && (!lapidacao || !pagamento || !download)) {
      redirecionar("painel_projeto.html");
      return;
    }

    if (pagina === "projeto_concluido.html" && !exportado) {
      redirecionar("painel_projeto.html");
      return;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", protegerFluxo);
  } else {
    protegerFluxo();
  }
})();
