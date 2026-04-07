(function () {
  const CHAVE_LOG = "lapidar_auditoria_obra";
  const CHAVE_OBRA_ID = "lapidar_obra_id";
  const CHAVE_OBRA_INICIO = "lapidar_obra_inicio";
  const CHAVE_TEMPO_CACHE = "lapidar_tempo_oficial_cache";

  function gerarObraId() {
    return "obra_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
  }

  function lerLog() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_LOG)) || [];
    } catch (e) {
      return [];
    }
  }

  function salvarLog(log) {
    localStorage.setItem(CHAVE_LOG, JSON.stringify(log));
  }

  function agoraLocalISO() {
    return new Date().toISOString();
  }

  function agoraLocalBR() {
    return new Date().toLocaleString("pt-BR");
  }

  async function obterTempoOficial() {
    try {
      const respostaConfig = await fetch("/tempo-oficial.json?ts=" + Date.now(), {
        cache: "no-store"
      });
      const config = await respostaConfig.json();

      if (config && config.usar_tempo_do_servidor === true) {
        const agora = new Date();
        const pacote = {
          horarioISO: agora.toISOString(),
          horarioBR: agora.toLocaleString("pt-BR"),
          origem: "tempo_institucional_lapidar"
        };

        localStorage.setItem(CHAVE_TEMPO_CACHE, JSON.stringify(pacote));
        return pacote;
      }
    } catch (erro) {}

    try {
      const cache = JSON.parse(localStorage.getItem(CHAVE_TEMPO_CACHE) || "{}");
      if (cache && cache.horarioISO) {
        return cache;
      }
    } catch (erro) {}

    return {
      horarioISO: agoraLocalISO(),
      horarioBR: agoraLocalBR(),
      origem: "tempo_local_fallback"
    };
  }

  async function garantirObraAtiva() {
    let obraId = localStorage.getItem(CHAVE_OBRA_ID);

    if (!obraId) {
      const tempo = await obterTempoOficial();
      obraId = gerarObraId();
      localStorage.setItem(CHAVE_OBRA_ID, obraId);
      localStorage.setItem(CHAVE_OBRA_INICIO, tempo.horarioISO);
    }

    return obraId;
  }

  function dadosBasicosDaObra() {
    return {
      obraId: localStorage.getItem(CHAVE_OBRA_ID) || "",
      iniciadoEm: localStorage.getItem(CHAVE_OBRA_INICIO) || "",
      titulo: localStorage.getItem("titulo_obra") || "",
      autor: localStorage.getItem("autor_obra") || "",
      organizador: localStorage.getItem("organizador_obra") || "",
      subtitulo: localStorage.getItem("subtitulo_obra") || "",
      tipoReconhecido: localStorage.getItem("tipo_material_reconhecido") || "",
      nomeArquivoTexto: localStorage.getItem("nome_arquivo_texto") || "",
      quantidadeImagens: localStorage.getItem("quantidade_imagens_obra") || "0",
      uploadTexto: localStorage.getItem("upload_texto_obra") || "nao",
      uploadImagens: localStorage.getItem("upload_imagens_obra") || "nao",
      uploadAudio: localStorage.getItem("upload_audio_obra") || "nao",
      gravacaoVoz: localStorage.getItem("gravacao_voz_autor") || "nao"
    };
  }

  async function registrarEvento(acao, detalhes) {
    await garantirObraAtiva();
    const tempo = await obterTempoOficial();
    const log = lerLog();

    log.push({
      obraId: localStorage.getItem(CHAVE_OBRA_ID),
      horarioISO: tempo.horarioISO,
      horarioBR: tempo.horarioBR,
      origemTempo: tempo.origem,
      acao: acao || "Ação não informada",
      detalhes: detalhes || {},
      obra: dadosBasicosDaObra(),
      paginaAtual: window.location.pathname || ""
    });

    salvarLog(log);
  }

  async function iniciarNovaObraAuditoria() {
    const tempo = await obterTempoOficial();

    localStorage.setItem(CHAVE_OBRA_ID, gerarObraId());
    localStorage.setItem(CHAVE_OBRA_INICIO, tempo.horarioISO);

    const log = lerLog();
    log.push({
      obraId: localStorage.getItem(CHAVE_OBRA_ID),
      horarioISO: tempo.horarioISO,
      horarioBR: tempo.horarioBR,
      origemTempo: tempo.origem,
      acao: "Nova obra iniciada no Lapidar",
      detalhes: {
        origem: "entrada_obra.html"
      },
      obra: dadosBasicosDaObra(),
      paginaAtual: window.location.pathname || ""
    });

    salvarLog(log);
  }

  function obterAuditoriaAtual() {
    return lerLog();
  }

  function limparAuditoriaAtual() {
    localStorage.removeItem(CHAVE_LOG);
    localStorage.removeItem(CHAVE_OBRA_ID);
    localStorage.removeItem(CHAVE_OBRA_INICIO);
    localStorage.removeItem(CHAVE_TEMPO_CACHE);
  }

  async function exportarRelatorioAdministrativo() {
    const tempo = await obterTempoOficial();
    const log = lerLog();

    const relatorio = {
      obraId: localStorage.getItem(CHAVE_OBRA_ID) || "",
      iniciadoEm: localStorage.getItem(CHAVE_OBRA_INICIO) || "",
      exportadoEm: tempo.horarioISO,
      exportadoEmBR: tempo.horarioBR,
      origemTempo: tempo.origem,
      dadosFinaisDaObra: {
        titulo: localStorage.getItem("titulo_obra") || "",
        autor: localStorage.getItem("autor_obra") || "",
        organizador: localStorage.getItem("organizador_obra") || "",
        subtitulo: localStorage.getItem("subtitulo_obra") || "",
        tipoReconhecido: localStorage.getItem("tipo_material_reconhecido") || "",
        estruturaDetectada: localStorage.getItem("estrutura_detectada") || "",
        observacoesTecnicas: localStorage.getItem("observacoes_tecnicas") || "",
        previewTexto: localStorage.getItem("preview_texto_limpo") || ""
      },
      materiais: {
        texto: localStorage.getItem("upload_texto_obra") || "nao",
        imagens: localStorage.getItem("upload_imagens_obra") || "nao",
        quantidadeImagens: localStorage.getItem("quantidade_imagens_obra") || "0",
        audio: localStorage.getItem("upload_audio_obra") || "nao",
        gravacaoVoz: localStorage.getItem("gravacao_voz_autor") || "nao",
        nomeArquivoTexto: localStorage.getItem("nome_arquivo_texto") || ""
      },
      modulos: {
        editorial: localStorage.getItem("modulo_editorial") || "nao",
        audiovisual: localStorage.getItem("modulo_audiovisual") || "nao",
        musica: localStorage.getItem("modulo_musica") || "nao",
        livroConfigurado: localStorage.getItem("modulo_livro_configurado") || "nao",
        audiovisualConfigurado: localStorage.getItem("modulo_audiovisual_configurado") || "nao",
        musicaConfigurado: localStorage.getItem("modulo_musica_configurado") || "nao"
      },
      eventos: log
    };

    localStorage.setItem("lapidar_relatorio_administrativo", JSON.stringify(relatorio));
    return relatorio;
  }

  async function iniciarSessaoModulo(nomeModulo) {
    const tempo = await obterTempoOficial();
    localStorage.setItem("lapidar_sessao_modulo_atual", nomeModulo);
    localStorage.setItem("lapidar_sessao_modulo_inicio", tempo.horarioISO);
    await registrarEvento("Sessão de módulo iniciada", {
      modulo: nomeModulo
    });
  }

  async function encerrarSessaoModulo(nomeModulo) {
    const tempo = await obterTempoOficial();
    const inicio = localStorage.getItem("lapidar_sessao_modulo_inicio") || "";
    const moduloAtual = localStorage.getItem("lapidar_sessao_modulo_atual") || nomeModulo || "";

    await registrarEvento("Sessão de módulo encerrada", {
      modulo: nomeModulo || moduloAtual,
      inicioSessao: inicio,
      fimSessao: tempo.horarioISO
    });

    localStorage.removeItem("lapidar_sessao_modulo_atual");
    localStorage.removeItem("lapidar_sessao_modulo_inicio");
  }

  window.LapidarAuditoria = {
    registrarEvento,
    iniciarNovaObraAuditoria,
    obterAuditoriaAtual,
    limparAuditoriaAtual,
    exportarRelatorioAdministrativo,
    iniciarSessaoModulo,
    encerrarSessaoModulo,
    obterTempoOficial
  };
})();
