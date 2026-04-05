(function () {
  const PRECO_AVULSO_BASE = 3.99;

  const PLANOS_DIAGRAMACAO = {
    mensal: {
      "10": 19.99,
      "30": 39.99,
      "50": 59.99,
      "90": 99.99,
      livre: 299.99
    },
    trimestral: {
      "10": 55,
      "30": 120,
      "50": 150,
      "90": 270
    },
    semestral: {
      "10": 100,
      "30": 220,
      "50": 280,
      "90": 520
    },
    anual: {
      "10": 180,
      "30": 400,
      "50": 540,
      "90": 980
    }
  };

  function numero(v, padrao = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : padrao;
  }

  function arred2(v) {
    return Math.round((numero(v) + Number.EPSILON) * 100) / 100;
  }

  function moedaBR(v) {
    return "R$ " + arred2(v).toFixed(2).replace(".", ",");
  }

  function somarLista(lista) {
    if (!Array.isArray(lista)) return 0;
    return arred2(
      lista.reduce((acc, item) => acc + numero(item, 0), 0)
    );
  }

  function contarItensAtivos(obj) {
    if (!obj || typeof obj !== "object") return 0;
    return Object.values(obj).filter(Boolean).length;
  }

  function calcularValorBasePorPlano(periodo, quantidade) {
    if (!periodo || !quantidade) return null;

    const tabela = PLANOS_DIAGRAMACAO[String(periodo).toLowerCase()];
    if (!tabela) return null;

    const qtd = String(quantidade).toLowerCase();
    const valorPlano = tabela[qtd];

    if (valorPlano === undefined) return null;
    if (qtd === "livre") return 0;

    return arred2(valorPlano / numero(quantidade, 1));
  }

  function inferirModoPorCVR(modoEscolhido, listaCVR) {
    const totalCVR = somarLista(listaCVR);

    if (modoEscolhido === "internacional") return "internacional";
    if (modoEscolhido === "nacional") return "nacional";

    if (modoEscolhido === "personalizado") {
      if (totalCVR === 0) return "personalizado_zero";
      return "hibrido";
    }

    if (modoEscolhido === "híbrido" || modoEscolhido === "hibrido") {
      return "hibrido";
    }

    if (totalCVR === 0) return "personalizado_zero";
    return "hibrido";
  }

  function calcularSetorBase(config = {}) {
    const topGlobal = !!config.topGlobal;
    const listaCVR = Array.isArray(config.cvrItens) ? config.cvrItens : [];
    const totalCVR = somarLista(listaCVR);
    const modoFinal = inferirModoPorCVR(
      String(config.modo || "").toLowerCase(),
      listaCVR
    );

    if (topGlobal) {
      return {
        setor: config.setor || "setor",
        topGlobal: true,
        modoFinal,
        valorBase: 0,
        totalCVR: 0,
        total: 0,
        detalhes: ["Top Global ativo"],
        exibirValor: false
      };
    }

    let valorBase = PRECO_AVULSO_BASE;
    let origemBase = "avulso";

    if (config.planoAtivo) {
      const porUnidade = calcularValorBasePorPlano(
        config.periodoPlano,
        config.quantidadePlano
      );

      if (porUnidade !== null) {
        valorBase = porUnidade;
        origemBase = "plano";
      }
    }

    if (modoFinal === "personalizado_zero") {
      valorBase = config.planoAtivo ? valorBase : PRECO_AVULSO_BASE;
      return {
        setor: config.setor || "setor",
        topGlobal: false,
        modoFinal,
        valorBase: arred2(valorBase),
        totalCVR: 0,
        total: arred2(valorBase),
        detalhes: [
          origemBase === "plano"
            ? "Valor-base por unidade do plano"
            : "Valor-base avulso",
          "Personalizado zero CVR"
        ],
        exibirValor: true
      };
    }

    return {
      setor: config.setor || "setor",
      topGlobal: false,
      modoFinal,
      valorBase: arred2(valorBase),
      totalCVR,
      total: arred2(valorBase + totalCVR),
      detalhes: [
        origemBase === "plano"
          ? "Valor-base por unidade do plano"
          : "Valor-base avulso",
        "CVR aplicado"
      ],
      exibirValor: true
    };
  }

  function calcularDiagramacao(config = {}) {
    return calcularSetorBase({
      setor: "Assistente de Diagramação",
      topGlobal: config.topGlobal,
      modo: config.modo,
      planoAtivo: config.planoAtivo,
      periodoPlano: config.periodoPlano,
      quantidadePlano: config.quantidadePlano,
      cvrItens: config.cvrItens || []
    });
  }

  function calcularCapista(config = {}) {
    return calcularSetorBase({
      setor: "OKapista",
      topGlobal: config.topGlobal,
      modo: config.modo,
      planoAtivo: config.planoAtivo,
      periodoPlano: config.periodoPlano,
      quantidadePlano: config.quantidadePlano,
      cvrItens: config.cvrItens || []
    });
  }

  function calcularTraducao(config = {}) {
    const topGlobal = !!config.topGlobal;
    const qtdIdiomas = Math.max(0, numero(config.quantidadeIdiomas, 0));

    if (topGlobal) {
      return {
        setor: "Segunda Língua(s)",
        quantidadeIdiomas: qtdIdiomas,
        total: 0,
        topGlobal: true,
        exibirValor: false,
        detalhes: ["Top Global ativo"]
      };
    }

    const total = arred2(qtdIdiomas * 25);

    return {
      setor: "Segunda Língua(s)",
      quantidadeIdiomas: qtdIdiomas,
      total,
      topGlobal: false,
      exibirValor: true,
      detalhes: [qtdIdiomas + " tradução(ões) x 25"]
    };
  }

  function calcularAvaliacao(config = {}) {
    const topGlobal = !!config.topGlobal;
    const qtdModulos = Math.max(0, numero(config.quantidadeModulos, 0));

    if (topGlobal) {
      return {
        setor: "Avaliação Literária",
        quantidadeModulos: qtdModulos,
        total: 0,
        topGlobal: true,
        exibirValor: false,
        detalhes: ["Top Global ativo"]
      };
    }

    let total = 0;
    if (qtdModulos === 1) total = 25;
    if (qtdModulos === 2) total = 35;
    if (qtdModulos === 3) total = 45;
    if (qtdModulos >= 4) total = 55;

    return {
      setor: "Avaliação Literária",
      quantidadeModulos: qtdModulos,
      total,
      topGlobal: false,
      exibirValor: true,
      detalhes: ["Avaliação por " + qtdModulos + " módulo(s)"]
    };
  }

  function calcularAnalisador(config = {}) {
    const topGlobal = !!config.topGlobal;
    const paginas = numero(config.paginasRelatorio, 0);

    if (topGlobal) {
      return {
        setor: "Analisador de Obra",
        paginasRelatorio: paginas,
        total: 0,
        topGlobal: true,
        exibirValor: false,
        detalhes: ["Top Global ativo"]
      };
    }

    let total = 0;
    if (paginas === 4) total = 25;
    else if (paginas === 6) total = 35;
    else if (paginas === 8) total = 45;
    else if (paginas >= 11) total = 55;

    return {
      setor: "Analisador de Obra",
      paginasRelatorio: paginas,
      total,
      topGlobal: false,
      exibirValor: true,
      detalhes: ["Relatório de " + paginas + " página(s)"]
    };
  }

  function calcularLapidacao(config = {}) {
    const topGlobal = !!config.topGlobal;

    if (topGlobal) {
      return {
        setor: "Lapidação Literária",
        total: 0,
        topGlobal: true,
        exibirValor: false,
        detalhes: ["Top Global ativo"]
      };
    }

    return {
      setor: "Lapidação Literária",
      total: 25,
      topGlobal: false,
      exibirValor: true,
      detalhes: ["Valor fixo da lapidação literária"]
    };
  }

  function calcularSiloSonoro(config = {}) {
    const topGlobal = !!config.topGlobal;
    const quantidadeAudiobooks = Math.max(0, numero(config.quantidadeAudiobooks, 0));
    const franquia = topGlobal ? 1 : 0;
    const cobraveis = Math.max(0, quantidadeAudiobooks - franquia);
    const total = arred2(cobraveis * 630);

    return {
      setor: "Silo Sonoro",
      quantidadeAudiobooks,
      franquiaGratis: franquia,
      cobraveis,
      total,
      topGlobal,
      exibirValor: cobraveis > 0,
      detalhes: topGlobal
        ? [
            "Top Global ativo",
            "1 audiobook incluído no período",
            cobraveis > 0
              ? cobraveis + " audiobook(s) adicional(is) cobrado(s)"
              : "Nenhum excedente cobrado"
          ]
        : [quantidadeAudiobooks + " audiobook(s) x 630"]
    };
  }

  function calcularExtras(config = {}) {
    let total = 0;
    const detalhes = [];

    if (config.gerarSinopse) {
      total += 1;
      detalhes.push("Sinopse ausente: +1");
    }

    if (config.gerarPrefacio) {
      total += 1;
      detalhes.push("Prefácio ausente: +1");
    }

    if (config.gerarBiografia) {
      total += 1;
      detalhes.push("Biografia ausente: +1");
    }

    if (config.gerarDedicatoria) {
      detalhes.push("Dedicatória: cortesia");
    }

    if (config.correcoesBasicas) {
      detalhes.push("Correção ortográfica/gramatical: cortesia");
    }

    if (config.avaliacaoGratuita) {
      detalhes.push("Avaliação inicial meia folha A5: cortesia");
    }

    return {
      setor: "Extras editoriais",
      total: arred2(total),
      topGlobal: false,
      exibirValor: total > 0,
      detalhes
    };
  }

  function calcularProjeto(config = {}) {
    const itens = [];

    if (config.modulos?.diagramacao) {
      itens.push(calcularDiagramacao(config.diagramacao || {}));
    }

    if (config.modulos?.capista) {
      itens.push(calcularCapista(config.capista || {}));
    }

    if (config.modulos?.traducao) {
      itens.push(calcularTraducao(config.traducao || {}));
    }

    if (config.modulos?.avaliacao) {
      itens.push(calcularAvaliacao(config.avaliacao || {}));
    }

    if (config.modulos?.analisador) {
      itens.push(calcularAnalisador(config.analisador || {}));
    }

    if (config.modulos?.lapidacao) {
      itens.push(calcularLapidacao(config.lapidacao || {}));
    }

    if (config.modulos?.siloSonoro) {
      itens.push(calcularSiloSonoro(config.siloSonoro || {}));
    }

    const extras = calcularExtras(config.extras || {});
    if (extras.total > 0 || (extras.detalhes && extras.detalhes.length)) {
      itens.push(extras);
    }

    const total = arred2(
      itens.reduce((acc, item) => acc + numero(item.total, 0), 0)
    );

    return {
      itens,
      total,
      totalFormatado: moedaBR(total)
    };
  }

  window.LapidarCalculo = {
    PRECO_AVULSO_BASE,
    PLANOS_DIAGRAMACAO,
    moedaBR,
    somarLista,
    contarItensAtivos,
    calcularValorBasePorPlano,
    inferirModoPorCVR,
    calcularDiagramacao,
    calcularCapista,
    calcularTraducao,
    calcularAvaliacao,
    calcularAnalisador,
    calcularLapidacao,
    calcularSiloSonoro,
    calcularExtras,
    calcularProjeto
  };
})();
