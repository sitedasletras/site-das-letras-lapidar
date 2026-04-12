/* =========================================================
   LAPIDAR INTELIGENCIA CORE v0.1
   NAS + FISA + FIIISAA
   ---------------------------------------------------------
   Camada central de inteligência da espinha dorsal do Lapidar
   Não substitui a espinha dorsal.
   Apenas observa, valida, registra e orienta o fluxo.
   ========================================================= */

(function () {
  "use strict";

  const LapidarCore = {
    version: "0.1",
    debug: true,

    allowedProfiles: ["admin", "heteronimo"],
    allowedEmails: ["planaswagner@gmail.com"],

    pageMap: {
      "pagina_respiro.html": { step: 0, label: "Página de Respiro", requires: [] },
      "painel_setores.html": { step: 1, label: "Painel de Setores", requires: [] },
      "modulo_01_bolsao.html": { step: 2, label: "Módulo 01 Bolsão", requires: [] },
      "modulo_02_sistema_desbaste.html": { step: 3, label: "Sistema Desbaste", requires: ["cofre_preparado"] },
      "obra_workspace.html": { step: 4, label: "Workspace da Obra", requires: ["desbaste_concluido"] },
      "modulo_executor.html": { step: 5, label: "Executor de Módulos", requires: ["desbaste_concluido", "workspace_liberado"] },
      "modulos_audiovisual.html": { step: 6, label: "Silos", requires: ["desbaste_concluido", "workspace_liberado", "executor_liberado"] },
      "modulo41_barracao_de_polimento_das_imagens.html": { step: 7, label: "Sistema Polir", requires: ["desbaste_concluido", "workspace_liberado", "executor_liberado"] },
      "mesario.html": { step: 8, label: "Mesário", requires: ["desbaste_concluido", "workspace_liberado", "executor_liberado"] },
      "auditoria.html": { step: 9, label: "Auditoria", requires: ["desbaste_concluido", "workspace_liberado", "executor_liberado"] },
      "exportar.html": { step: 10, label: "Exportação", requires: ["desbaste_concluido", "workspace_liberado", "executor_liberado"] }
    },

    stateAliases: {
      perfil: ["perfilUsuario", "perfilAtivo"],
      email: ["emailUsuario"],
      usuario: ["usuarioLogado"],
      obra: ["obraAtual", "matriz_editorial_ativa"],
      cofre: ["cofre_preparado"],
      desbaste: ["desbaste_concluido", "lapidar_desbaste_concluido", "status_desbaste"],
      workspace: ["workspace_liberado", "matriz_editorial_ativa"],
      executor: ["executor_liberado"],
      silos: ["lapidar_passou_silos", "silos_concluidos"],
      polir: ["polir_concluido"],
      mesario: ["mesario_concluido"],
      auditoria: ["auditoria_concluida"],
      exportacao: ["exportacao_concluida"]
    },

    getPage() {
      const p = window.location.pathname.split("/").pop();
      return p || "desconhecida.html";
    },

    getStorage(key) {
      const local = localStorage.getItem(key);
      if (local !== null) return local;
      const session = sessionStorage.getItem(key);
      if (session !== null) return session;
      return null;
    },

    getFirstValue(keys) {
      for (const key of keys) {
        const value = this.getStorage(key);
        if (value !== null && value !== "") return value;
      }
      return null;
    },

    getBool(keys) {
      for (const key of keys) {
        const value = this.getStorage(key);
        if (value === null) continue;
        if (value === "true" || value === "concluido" || value === "concluída" || value === "ativo" || value === "1") {
          return true;
        }
        if (value === "false" || value === "0") {
          return false;
        }
      }
      return false;
    },

    normalizeState() {
      return {
        page: this.getPage(),
        perfil: (this.getFirstValue(this.stateAliases.perfil) || "usuario").toLowerCase(),
        email: (this.getFirstValue(this.stateAliases.email) || "").toLowerCase(),
        usuario: this.getFirstValue(this.stateAliases.usuario) || "Não identificado",
        obraAtiva: this.getFirstValue(this.stateAliases.obra),
        cofrePreparado: this.getBool(this.stateAliases.cofre),
        desbasteConcluido: this.getBool(this.stateAliases.desbaste),
        workspaceLiberado: this.getBool(this.stateAliases.workspace),
        executorLiberado: this.getBool(this.stateAliases.executor),
        passouSilos: this.getBool(this.stateAliases.silos),
        polirConcluido: this.getBool(this.stateAliases.polir),
        mesarioConcluido: this.getBool(this.stateAliases.mesario),
        auditoriaConcluida: this.getBool(this.stateAliases.auditoria),
        exportacaoConcluida: this.getBool(this.stateAliases.exportacao)
      };
    },

    isAuthorized(state) {
      return this.allowedProfiles.includes(state.perfil) || this.allowedEmails.includes(state.email);
    },

    ensureFisaRegistry() {
      const existing = this.getStorage("fisaPesquisaTecnologica");
      if (existing) return;

      const registry = {
        versao: "0.1",
        ultimaAtualizacao: new Date().toISOString(),
        objetivo: "Pesquisar tecnologias úteis ao crescimento do Lapidar sem quebrar a espinha dorsal.",
        monitoradas: ["Google AI Studio", "Google Stitch", "Google Flow", "Google Pomelli"],
        status: "ativo"
      };

      localStorage.setItem("fisaPesquisaTecnologica", JSON.stringify(registry));
    },

    validateState(state) {
      const meta = this.pageMap[state.page] || null;

      const report = {
        data: new Date().toISOString(),
        pagina: state.page,
        etapa: meta ? meta.label : "Página fora do mapa oficial",
        perfil: state.perfil,
        email: state.email || "nao informado",
        score: 100,
        risco: "baixo",
        pendencias: [],
        sinais: []
      };

      if (!meta) {
        report.score -= 30;
        report.risco = "alto";
        report.pendencias.push("Página fora da espinha dorsal oficial.");
        return report;
      }

      for (const requirement of meta.requires) {
        if (requirement === "cofre_preparado" && !state.cofrePreparado) {
          report.score -= 20;
          report.pendencias.push("Cofre/Bolsão ainda não preparado.");
        }
        if (requirement === "desbaste_concluido" && !state.desbasteConcluido) {
          report.score -= 20;
          report.pendencias.push("Desbaste não concluído.");
        }
        if (requirement === "workspace_liberado" && !state.workspaceLiberado) {
          report.score -= 20;
          report.pendencias.push("Workspace ainda não liberado.");
        }
        if (requirement === "executor_liberado" && !state.executorLiberado) {
          report.score -= 20;
          report.pendencias.push("Executor ainda não liberado.");
        }
      }

      if (state.page === "modulo41_barracao_de_polimento_das_imagens.html" && !state.passouSilos) {
        report.score -= 10;
        report.pendencias.push("Polir acessado sem marcação de passagem pelos Silos.");
      }

      if (state.page === "mesario.html" && !state.passouSilos) {
        report.score -= 10;
        report.pendencias.push("Mesário acessado sem marcação de passagem pelos Silos.");
      }

      if (state.obraAtiva) {
        report.sinais.push("Obra ativa detectada.");
      } else {
        report.score -= 10;
        report.pendencias.push("Nenhuma obra ativa detectada no estado consolidado.");
      }

      if (report.score < 80) report.risco = "medio";
      if (report.score < 60) report.risco = "alto";

      return report;
    },

    persistReport(report) {
      let history = [];
      try {
        history = JSON.parse(localStorage.getItem("nasRelatoriosCore") || "[]");
      } catch (e) {
        history = [];
      }

      history.unshift(report);
      localStorage.setItem("nasRelatoriosCore", JSON.stringify(history.slice(0, 50)));
    },

    persistTrail(state) {
      let trail = [];
      try {
        trail = JSON.parse(localStorage.getItem("lapidarTrilhaCore") || "[]");
      } catch (e) {
        trail = [];
      }

      trail.unshift({
        data: new Date().toISOString(),
        pagina: state.page,
        perfil: state.perfil,
        obraAtiva: !!state.obraAtiva
      });

      localStorage.setItem("lapidarTrilhaCore", JSON.stringify(trail.slice(0, 100)));
    },

    setDerivedFlags(state) {
      if (state.page === "modulo_executor.html") {
        localStorage.setItem("executor_liberado", "true");
      }
      if (state.page === "modulos_audiovisual.html") {
        localStorage.setItem("lapidar_passou_silos", "true");
      }
    },

    buildPanel(state, report) {
      if (!this.isAuthorized(state)) return;

      const old = document.getElementById("lapidar-core-panel");
      if (old) old.remove();

      const panel = document.createElement("div");
      panel.id = "lapidar-core-panel";
      panel.style.position = "fixed";
      panel.style.right = "10px";
      panel.style.bottom = "10px";
      panel.style.zIndex = "99999";
      panel.style.width = "min(92vw, 340px)";
      panel.style.background = "rgba(15,23,42,0.96)";
      panel.style.color = "#fff";
      panel.style.padding = "12px";
      panel.style.borderRadius = "14px";
      panel.style.border = "1px solid rgba(255,255,255,0.10)";
      panel.style.boxShadow = "0 12px 30px rgba(0,0,0,0.28)";
      panel.style.fontFamily = "Arial, sans-serif";
      panel.style.fontSize = "12px";
      panel.style.lineHeight = "1.45";

      const pendencias = report.pendencias.length
        ? report.pendencias.map(item => "• " + item).join("<br>")
        : "• Nenhuma pendência estrutural crítica.";

      panel.innerHTML = `
        <div style="font-weight:700;margin-bottom:6px;">FIIISAA / FISA / NAS</div>
        <div><b>Página:</b> ${state.page}</div>
        <div><b>Etapa:</b> ${report.etapa}</div>
        <div><b>Perfil:</b> ${state.perfil}</div>
        <div><b>Score:</b> ${report.score}</div>
        <div><b>Risco:</b> ${report.risco}</div>
        <div style="margin-top:8px;"><b>Pendências:</b><br>${pendencias}</div>
      `;

      document.body.appendChild(panel);
    },

    boot() {
      this.ensureFisaRegistry();

      const state = this.normalizeState();
      this.setDerivedFlags(state);

      const report = this.validateState(state);
      this.persistReport(report);
      this.persistTrail(state);
      this.buildPanel(state, report);
    }
  };

  window.LapidarCore = LapidarCore;
  window.addEventListener("load", function () {
    LapidarCore.boot();
  });
})();
