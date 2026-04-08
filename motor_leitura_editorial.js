(function (global) {
  "use strict";

  const PLACEHOLDER_EXATOS = [
    "aqui vai o selo",
    "selo editorial",
    "inserir selo",
    "colocar selo",
    "aqui entra o selo",
    "aqui vai a imagem",
    "inserir imagem",
    "colocar imagem",
    "aqui vai a capa",
    "aqui entra a capa",
    "texto da contracapa",
    "texto de orelha",
    "biografia do autor",
    "prefácio",
    "dedicatória",
    "sumário",
    "ficha catalográfica"
  ];

  const TERMOS_RUIDO_PERSONAGEM = new Set([
    "Observei", "Durante", "Essa", "Aquela", "Aquele", "Nessa", "Nisso", "Agora", "Depois",
    "Quando", "Então", "Levantei", "Olhou", "Capítulo", "Autor", "Prefácio", "Dedicatória",
    "Sumário", "Prólogo", "Epílogo", "Selo", "Editorial", "Imagem", "Capa", "Contra",
    "Contracapa", "Orelha", "Livro", "Tipo", "Narrador", "Clima", "Gênero", "Estilo",
    "Ele", "Ela", "Eles", "Elas", "Mas", "Uma", "Um", "Uns", "Umas", "Como", "Apenas",
    "Boa", "Boas", "Algumas", "Alguns", "Esta", "Este", "Essa", "Esse", "Aquilo", "Nada",
    "Tudo", "Todos", "Todas", "Foi", "Era", "Seria", "Havia", "Tinha", "Chicago"
  ]);

  const PALAVRAS_FUNCIONAIS = new Set([
    "a","o","as","os","um","uma","uns","umas","de","da","do","das","dos","e","ou","mas","por",
    "para","com","sem","sob","sobre","entre","até","após","antes","depois","quando","então",
    "como","porque","que","se","em","no","na","nos","nas","ao","aos","à","às","ele","ela",
    "eles","elas","essa","esse","esta","este","isso","isto","aquilo","algum","alguma","alguns",
    "algumas","muito","muita","muitos","muitas","pouco","pouca","poucos","poucas","boa","bom",
    "boas","bons","me","te","se","lhe","lhes","eu","tu","nós","vos"
  ]);

  function normalizarTexto(texto) {
    return (texto || "")
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function linhaPlaceholder(linha) {
    const t = (linha || "").trim().toLowerCase();

    if (!t) return true;
    if (PLACEHOLDER_EXATOS.includes(t)) return true;
    if (/^aqui vai\b/.test(t)) return true;
    if (/^aqui entra\b/.test(t)) return true;
    if (/^inserir\b/.test(t)) return true;
    if (/^colocar\b/.test(t)) return true;
    if (/^texto de\b/.test(t)) return true;
    if (/^modelo de\b/.test(t)) return true;
    if (/^exemplo de\b/.test(t)) return true;
    if (/^observa[cç][aã]o\b/.test(t)) return true;
    if (/^nota\b/.test(t)) return true;
    if (/^instru[cç][aã]o\b/.test(t)) return true;
    if (/^orienta[cç][aã]o\b/.test(t)) return true;
    if (/^marcar\b/.test(t)) return true;
    if (/^reservar\b/.test(t)) return true;
    if (/^espa[cç]o para\b/.test(t)) return true;
    if (/^local para\b/.test(t)) return true;
    if (/^legenda\b/.test(t)) return true;
    if (/^word\/numbering\.xml/.test(t)) return true;
    if (/^pk/.test(t)) return true;

    return false;
  }

  function linhaEstruturalRuido(linha) {
    const t = (linha || "").trim().toLowerCase();

    if (/^#{1,6}\s/.test(linha)) return false;
    if (/^cap[ií]tulo\s+[ivxlcdm\d]+/i.test(linha)) return false;
    if (/^pr[oó]logo/i.test(linha)) return false;
    if (/^ep[ií]logo/i.test(linha)) return false;
    if (/^conto de /i.test(linha)) return false;
    if (/^romance de /i.test(linha)) return false;
    if (/^poema de /i.test(linha)) return false;

    if (/^t[ií]tulo:/i.test(t)) return true;
    if (/^subt[ií]tulo:/i.test(t)) return true;
    if (/^isbn:/i.test(t)) return true;
    if (/^cdd:/i.test(t)) return true;
    if (/^cdu:/i.test(t)) return true;
    if (/^cutter:/i.test(t)) return true;
    if (/^site das letras/i.test(t)) return true;
    if (/^edi[cç][oõ]es liter[aá]rias/i.test(t)) return true;
    if (/^house of letters/i.test(t)) return true;

    return false;
  }

  function limparEstruturaEditorial(texto) {
    const linhas = (texto || "").split("\n");
    const limpas = [];

    for (let linha of linhas) {
      const original = linha;
      linha = linha.replace(/\u0000/g, "").trim();

      if (!linha) continue;
      if (linhaPlaceholder(linha)) continue;
      if (linhaEstruturalRuido(linha)) continue;
      if (linha.length <= 2) continue;
      if (/^[-_=]{3,}$/.test(linha)) continue;
      if (/^(ok|teste|teste teste)$/i.test(linha)) continue;

      limpas.push(original.trim());
    }

    return normalizarTexto(limpas.join("\n"));
  }

  function quebrarTituloAutorNaMesmaLinha(texto) {
    return texto.replace(
      /^(.+?)\s+(Conto de|Romance de|Poema de)\s+(.+)$/gim,
      function (_, titulo, marcador, autor) {
        return titulo.trim() + "\n" + marcador.trim() + " " + autor.trim();
      }
    );
  }

  function prepararTextoParaLeitura(texto) {
    let t = normalizarTexto(texto || "");
    t = quebrarTituloAutorNaMesmaLinha(t);
    return t;
  }

  function detectarTitulo(texto) {
    const textoPreparado = prepararTextoParaLeitura(texto);
    const linhas = textoPreparado.split("\n").map(l => l.trim()).filter(Boolean);

    for (const linha of linhas) {
      if (linhaPlaceholder(linha)) continue;
      if (linhaEstruturalRuido(linha)) continue;
      if (linha.length < 3) continue;
      if (linha.length > 120) continue;
      if (/^autor:/i.test(linha)) continue;
      if (/^(conto|romance|poema)\s+de\s+/i.test(linha)) continue;
      if (/^cap[ií]tulo\s+[ivxlcdm\d]+/i.test(linha)) continue;
      if (/^pref[aá]cio/i.test(linha)) continue;
      if (/^dedicat[oó]ria/i.test(linha)) continue;

      return linha;
    }

    return "Não identificado";
  }

  function detectarAutor(texto) {
    const textoPreparado = prepararTextoParaLeitura(texto);
    const linhas = textoPreparado.split("\n").map(l => l.trim()).filter(Boolean);

    for (const linha of linhas) {
      const lower = linha.toLowerCase();

      if (lower.startsWith("autor:")) {
        return linha.replace(/autor:/i, "").trim() || "Não identificado";
      }

      if (lower.startsWith("por:")) {
        return linha.replace(/por:/i, "").trim() || "Não identificado";
      }

      if (/^(conto|romance|poema)\s+de\s+/i.test(linha)) {
        return linha.replace(/^(conto|romance|poema)\s+de\s+/i, "").trim() || "Não identificado";
      }
    }

    const titulo = detectarTitulo(textoPreparado);
    const idx = linhas.findIndex(l => l === titulo);

    if (idx >= 0) {
      for (let i = idx + 1; i < Math.min(idx + 6, linhas.length); i++) {
        const linha = linhas[i];
        if (/^cap[ií]tulo\s+[ivxlcdm\d]+/i.test(linha)) break;
        if (
          linha.length >= 5 &&
          linha.length <= 80 &&
          !linhaPlaceholder(linha) &&
          !linhaEstruturalRuido(linha) &&
          /^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][A-Za-zÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇáàâãéèêíìîóòôõúùûç ]+$/.test(linha)
        ) {
          return linha;
        }
      }
    }

    return "Não identificado";
  }

  function detectarCapitulos(texto) {
    const achados = texto.match(/(?:^|\n)(cap[ií]tulo\s+[ivxlcdm\d]+|pr[oó]logo|ep[ií]logo)/gim) || [];
    return achados.map(item => item.trim());
  }

  function tokenEhRuido(token) {
    if (!token) return true;
    if (TERMOS_RUIDO_PERSONAGEM.has(token)) return true;
    if (PALAVRAS_FUNCIONAIS.has(token.toLowerCase())) return true;
    if (/^\d+$/.test(token)) return true;
    if (token.length < 3) return true;
    if (/^(Segunda|Terceira|Primeira|Sombrio|Neutro|Romance|Fantasia|Comédia|Suspense|Dramático|Intimista)$/i.test(token)) return true;
    return false;
  }

  function detectarPersonagens(texto) {
    const candidatos = texto.match(/\b[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][a-záàâãéèêíìîóòôõúùûç]{2,}\b/g) || [];
    const contagem = {};

    candidatos.forEach(token => {
      if (tokenEhRuido(token)) return;
      contagem[token] = (contagem[token] || 0) + 1;
    });

    return Object.entries(contagem)
      .filter(item => item[1] >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(item => item[0]);
  }

  function removerDialogos(texto) {
    let linhas = texto.split("\n");
    let filtradas = linhas.filter(linha => {
      let t = linha.trim();
      if (t.startsWith("—")) return false;
      if (t.startsWith("-")) return false;
      if (t.startsWith('"')) return false;
      if (t.startsWith("“")) return false;
      return true;
    });

    let semDialogos = filtradas.join("\n");
    semDialogos = semDialogos.replace(/"[^"]*"/g, " ");
    semDialogos = semDialogos.replace(/“[^”]*”/g, " ");
    semDialogos = semDialogos.replace(/'[^']*'/g, " ");

    return semDialogos;
  }

  function contarOcorrencias(texto, termos) {
    let total = 0;
    for (const termo of termos) {
      const regex = new RegExp("\\b" + termo + "\\b", "gi");
      const encontrados = texto.match(regex);
      if (encontrados) total += encontrados.length;
    }
    return total;
  }

  function detectarNarrador(texto) {
    const narracao = removerDialogos(texto).toLowerCase();

    const primeiraPessoa = [
      "eu", "me", "mim", "comigo", "meu", "minha", "meus", "minhas",
      "fui", "estou", "estava", "pensei", "senti", "vi", "ouvi", "lembrei"
    ];

    const terceiraPessoa = [
      "ele", "ela", "eles", "elas", "dele", "dela",
      "olhou", "viu", "sentiu", "pensou", "caminhou", "falou", "respondeu", "perguntou"
    ];

    const pontosPrimeira = contarOcorrencias(narracao, primeiraPessoa);
    const pontosTerceira = contarOcorrencias(narracao, terceiraPessoa);

    if (pontosPrimeira >= pontosTerceira * 1.5 && pontosPrimeira >= 5) {
      return { valor: "Narrador em primeira pessoa", score: pontosPrimeira };
    }

    if (pontosTerceira >= pontosPrimeira * 1.5 && pontosTerceira >= 5) {
      return { valor: "Narrador em terceira pessoa", score: pontosTerceira };
    }

    if (pontosPrimeira > 0 && pontosTerceira > 0) {
      return { valor: "Narrador misto ou não conclusivo", score: Math.max(pontosPrimeira, pontosTerceira) };
    }

    return { valor: "Narrador não identificado", score: 0 };
  }

  function pontuarCategorias(texto, categorias) {
    const t = texto.toLowerCase();
    const scores = {};
    const evidencias = {};

    Object.keys(categorias).forEach(cat => {
      scores[cat] = 0;
      evidencias[cat] = [];

      categorias[cat].forEach(item => {
        const encontrados = t.match(item.regex);
        if (encontrados) {
          scores[cat] += encontrados.length * item.peso;
          evidencias[cat].push(item.rotulo + " (" + encontrados.length + ")");
        }
      });
    });

    return { scores, evidencias };
  }

  function decidirCategoria(scores, evidencias, minimo = 3, margem = 2) {
    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = entries[0] || ["Não identificado", 0];
    const second = entries[1] || ["", 0];

    if (top[1] < minimo) {
      return {
        valor: "Não conclusivo",
        score: top[1],
        detalhe: "Sinais insuficientes para conclusão segura.",
        evidencias: []
      };
    }

    if ((top[1] - second[1]) < margem) {
      return {
        valor: "Misto ou não conclusivo",
        score: top[1],
        detalhe: "Há sinais relevantes em mais de uma direção.",
        evidencias: evidencias[top[0]] || []
      };
    }

    return {
      valor: top[0],
      score: top[1],
      detalhe: "Classificação por predominância de sinais textuais.",
      evidencias: evidencias[top[0]] || []
    };
  }

  function detectarTipoObra(texto) {
    const categorias = {
      "Livro gastronômico": [
        { regex: /\bingredientes\b/gi, peso: 3, rotulo: "ingredientes" },
        { regex: /\bmodo de preparo\b/gi, peso: 3, rotulo: "modo de preparo" },
        { regex: /\brende\b/gi, peso: 2, rotulo: "rendimento" },
        { regex: /\bforno\b/gi, peso: 1, rotulo: "cozinha" }
      ],
      "Poesia": [
        { regex: /\bsoneto\b/gi, peso: 3, rotulo: "soneto" },
        { regex: /\bpoema\b/gi, peso: 2, rotulo: "poema" },
        { regex: /\bpoesia\b/gi, peso: 2, rotulo: "poesia" },
        { regex: /\bhaicai\b/gi, peso: 3, rotulo: "haicai" },
        { regex: /\bverso\b/gi, peso: 2, rotulo: "verso" },
        { regex: /\bestrofe\b/gi, peso: 2, rotulo: "estrofe" }
      ],
      "Narrativa em capítulos": [
        { regex: /\bcap[ií]tulo\s+[ivxlcdm\d]+\b/gi, peso: 4, rotulo: "capítulos" },
        { regex: /\bpr[oó]logo\b/gi, peso: 2, rotulo: "prólogo" },
        { regex: /\bep[ií]logo\b/gi, peso: 2, rotulo: "epílogo" }
      ],
      "Conto ou narrativa curta": [
        { regex: /\bconto\b/gi, peso: 4, rotulo: "conto" },
        { regex: /\bdepois\b/gi, peso: 1, rotulo: "progressão curta" },
        { regex: /\baté começar a investigar\b/gi, peso: 3, rotulo: "estrutura curta" }
      ],
      "Livro técnico ou didático": [
        { regex: /\bobjetivo\b/gi, peso: 2, rotulo: "objetivo" },
        { regex: /\bmetodologia\b/gi, peso: 3, rotulo: "metodologia" },
        { regex: /\bconceito\b/gi, peso: 2, rotulo: "conceito" },
        { regex: /\bdefini[cç][aã]o\b/gi, peso: 2, rotulo: "definição" },
        { regex: /\bexemplo\b/gi, peso: 1, rotulo: "exemplo" }
      ],
      "Livro infantil ou infantojuvenil": [
        { regex: /\bcrian[cç]a\b/gi, peso: 2, rotulo: "criança" },
        { regex: /\binfantil\b/gi, peso: 3, rotulo: "infantil" },
        { regex: /\bmenino\b/gi, peso: 1, rotulo: "menino" },
        { regex: /\bmenina\b/gi, peso: 1, rotulo: "menina" },
        { regex: /\baventura\b/gi, peso: 1, rotulo: "aventura" }
      ]
    };

    const { scores, evidencias } = pontuarCategorias(texto, categorias);
    return decidirCategoria(scores, evidencias, 3, 2);
  }

  function detectarGenero(texto) {
    const categorias = {
      "Comédia": [
        { regex: /\briso\b/gi, peso: 2, rotulo: "riso" },
        { regex: /\brindo\b/gi, peso: 2, rotulo: "rindo" },
        { regex: /\bengra[cç]ad[oa]\b/gi, peso: 3, rotulo: "comicidade direta" },
        { regex: /\btrapalhad[ao]\b/gi, peso: 3, rotulo: "trapalhada" },
        { regex: /\bconfus[aã]o\b/gi, peso: 2, rotulo: "confusão" },
        { regex: /\bvergonha\b/gi, peso: 2, rotulo: "constrangimento" },
        { regex: /\bdeboche\b/gi, peso: 3, rotulo: "deboche" },
        { regex: /\bsarcasmo\b/gi, peso: 3, rotulo: "sarcasmo" },
        { regex: /\bironia\b/gi, peso: 2, rotulo: "ironia" },
        { regex: /\brid[ií]cul[oa]\b/gi, peso: 2, rotulo: "ridículo" },
        { regex: /\babsurd[oa]\b/gi, peso: 2, rotulo: "absurdo" },
        { regex: /\bhumilha[cç][aã]o\b/gi, peso: 2, rotulo: "humilhação cômica" }
      ],
      "Romance": [
        { regex: /\bamor\b/gi, peso: 3, rotulo: "amor" },
        { regex: /\bpaix[aã]o\b/gi, peso: 3, rotulo: "paixão" },
        { regex: /\bbeijo\b/gi, peso: 2, rotulo: "beijo" },
        { regex: /\bcora[cç][aã]o\b/gi, peso: 2, rotulo: "coração" },
        { regex: /\bsaudade\b/gi, peso: 2, rotulo: "saudade" },
        { regex: /\bcasamento\b/gi, peso: 2, rotulo: "casamento" }
      ],
      "Fantasia": [
        { regex: /\bdrag[aã]o\b/gi, peso: 4, rotulo: "dragão" },
        { regex: /\bcastelo\b/gi, peso: 3, rotulo: "castelo" },
        { regex: /\breino\b/gi, peso: 3, rotulo: "reino" },
        { regex: /\bfeiticeir[oa]\b/gi, peso: 4, rotulo: "feiticeiro" },
        { regex: /\bespada\b/gi, peso: 2, rotulo: "espada" },
        { regex: /\bmagia\b/gi, peso: 4, rotulo: "magia" }
      ],
      "Ficção científica": [
        { regex: /\brob[oô]\b/gi, peso: 4, rotulo: "robô" },
        { regex: /\bintelig[eê]ncia artificial\b/gi, peso: 5, rotulo: "IA explícita" },
        { regex: /\bia\b/gi, peso: 3, rotulo: "ia" },
        { regex: /\bnave\b/gi, peso: 4, rotulo: "nave" },
        { regex: /\bplaneta\b/gi, peso: 3, rotulo: "planeta" },
        { regex: /\bfuturo\b/gi, peso: 3, rotulo: "futuro" },
        { regex: /\bcibern[eé]tic[oa]\b/gi, peso: 4, rotulo: "cibernético" },
        { regex: /\balien[ií]gena\b/gi, peso: 4, rotulo: "alienígena" }
      ],
      "Suspense policial": [
        { regex: /\bcrime\b/gi, peso: 4, rotulo: "crime" },
        { regex: /\binvestiga[cç][aã]o\b/gi, peso: 4, rotulo: "investigação" },
        { regex: /\bassassinato\b/gi, peso: 5, rotulo: "assassinato" },
        { regex: /\bdetetive\b/gi, peso: 4, rotulo: "detetive" },
        { regex: /\bmist[eé]rio\b/gi, peso: 2, rotulo: "mistério" },
        { regex: /\bculpado\b/gi, peso: 2, rotulo: "culpado" }
      ],
      "Terror": [
        { regex: /\bmedo\b/gi, peso: 3, rotulo: "medo" },
        { regex: /\btrevas\b/gi, peso: 4, rotulo: "trevas" },
        { regex: /\bsombra\b/gi, peso: 3, rotulo: "sombra" },
        { regex: /\bmaldi[cç][aã]o\b/gi, peso: 4, rotulo: "maldição" },
        { regex: /\bhorror\b/gi, peso: 4, rotulo: "horror" },
        { regex: /\bmonstro\b/gi, peso: 3, rotulo: "monstro" }
      ],
      "Épico histórico": [
        { regex: /\bguerra\b/gi, peso: 3, rotulo: "guerra" },
        { regex: /\bbatalha\b/gi, peso: 3, rotulo: "batalha" },
        { regex: /\bimp[eé]rio\b/gi, peso: 3, rotulo: "império" },
        { regex: /\brei\b/gi, peso: 2, rotulo: "rei" },
        { regex: /\brainha\b/gi, peso: 2, rotulo: "rainha" },
        { regex: /\btrono\b/gi, peso: 2, rotulo: "trono" }
      ]
    };

    const { scores, evidencias } = pontuarCategorias(texto, categorias);
    return decidirCategoria(scores, evidencias, 4, 2);
  }

  function detectarEstilo(texto) {
    const categorias = {
      "Cômico ou satírico": [
        { regex: /\bironia\b/gi, peso: 3, rotulo: "ironia" },
        { regex: /\bsarcasmo\b/gi, peso: 3, rotulo: "sarcasmo" },
        { regex: /\bdeboche\b/gi, peso: 3, rotulo: "deboche" },
        { regex: /\bengra[cç]ado\b/gi, peso: 2, rotulo: "engraçado" },
        { regex: /\babsurdo\b/gi, peso: 2, rotulo: "absurdo" }
      ],
      "Lírico": [
        { regex: /\bcora[cç][aã]o\b/gi, peso: 2, rotulo: "coração" },
        { regex: /\balma\b/gi, peso: 2, rotulo: "alma" },
        { regex: /\bsaudade\b/gi, peso: 2, rotulo: "saudade" },
        { regex: /\bpoesia\b/gi, peso: 3, rotulo: "poesia" },
        { regex: /\bverso\b/gi, peso: 3, rotulo: "verso" }
      ],
      "Intimista": [
        { regex: /\bsenti\b/gi, peso: 2, rotulo: "senti" },
        { regex: /\bpensei\b/gi, peso: 2, rotulo: "pensei" },
        { regex: /\blembran[cç]a\b/gi, peso: 2, rotulo: "lembrança" },
        { regex: /\bmem[oó]ria\b/gi, peso: 2, rotulo: "memória" },
        { regex: /\bsolid[aã]o\b/gi, peso: 2, rotulo: "solidão" }
      ],
      "Didático ou explicativo": [
        { regex: /\bconceito\b/gi, peso: 3, rotulo: "conceito" },
        { regex: /\bdefini[cç][aã]o\b/gi, peso: 3, rotulo: "definição" },
        { regex: /\bobjetivo\b/gi, peso: 2, rotulo: "objetivo" },
        { regex: /\bexplica\b/gi, peso: 2, rotulo: "explicação" },
        { regex: /\bexemplo\b/gi, peso: 2, rotulo: "exemplo" }
      ],
      "Dramático": [
        { regex: /\bconflito\b/gi, peso: 2, rotulo: "conflito" },
        { regex: /\bgritou\b/gi, peso: 2, rotulo: "gritou" },
        { regex: /\bchorou\b/gi, peso: 2, rotulo: "chorou" },
        { regex: /\bperdeu\b/gi, peso: 2, rotulo: "perdeu" },
        { regex: /\btrag[eé]dia\b/gi, peso: 3, rotulo: "tragédia" }
      ],
      "Épico": [
        { regex: /\bguerra\b/gi, peso: 3, rotulo: "guerra" },
        { regex: /\bbatalha\b/gi, peso: 3, rotulo: "batalha" },
        { regex: /\bconquista\b/gi, peso: 2, rotulo: "conquista" },
        { regex: /\breino\b/gi, peso: 2, rotulo: "reino" },
        { regex: /\bgl[oó]ria\b/gi, peso: 2, rotulo: "glória" }
      ]
    };

    const { scores, evidencias } = pontuarCategorias(texto, categorias);
    return decidirCategoria(scores, evidencias, 3, 2);
  }

  function detectarClima(texto) {
    const categorias = {
      "Sombrio": [
        { regex: /\bmedo\b/gi, peso: 3, rotulo: "medo" },
        { regex: /\bsombra\b/gi, peso: 3, rotulo: "sombra" },
        { regex: /\btrevas\b/gi, peso: 4, rotulo: "trevas" },
        { regex: /\bsegredo\b/gi, peso: 2, rotulo: "segredo" },
        { regex: /\bnoite\b/gi, peso: 2, rotulo: "noite" }
      ],
      "Emocional": [
        { regex: /\bamor\b/gi, peso: 3, rotulo: "amor" },
        { regex: /\bsaudade\b/gi, peso: 2, rotulo: "saudade" },
        { regex: /\bcora[cç][aã]o\b/gi, peso: 2, rotulo: "coração" },
        { regex: /\bl[aá]grima\b/gi, peso: 2, rotulo: "lágrima" }
      ],
      "Leve ou cômico": [
        { regex: /\briso\b/gi, peso: 2, rotulo: "riso" },
        { regex: /\bengra[cç]ad[oa]\b/gi, peso: 3, rotulo: "engraçado" },
        { regex: /\btrapalhad[ao]\b/gi, peso: 3, rotulo: "trapalhada" },
        { regex: /\bironia\b/gi, peso: 2, rotulo: "ironia" },
        { regex: /\bdeboche\b/gi, peso: 2, rotulo: "deboche" }
      ],
      "Épico": [
        { regex: /\bguerra\b/gi, peso: 3, rotulo: "guerra" },
        { regex: /\bbatalha\b/gi, peso: 3, rotulo: "batalha" },
        { regex: /\breino\b/gi, peso: 2, rotulo: "reino" },
        { regex: /\bespada\b/gi, peso: 2, rotulo: "espada" }
      ]
    };

    const { scores, evidencias } = pontuarCategorias(texto, categorias);
    return decidirCategoria(scores, evidencias, 2, 2);
  }

  function reconstruirParagrafos(texto) {
    const original = normalizarTexto(texto || "");
    let paragrafos = original
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean);

    if (paragrafos.length > 2) {
      return paragrafos;
    }

    const linhas = original
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    if (linhas.length > 4) {
      return linhas;
    }

    const frases = original
      .split(/(?<=[\.\!\?])\s+(?=[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ“"—])/)
      .map(f => f.trim())
      .filter(Boolean);

    return frases.length ? frases : [original];
  }

  function montarBlocosSemanticos(texto) {
    const paragrafos = reconstruirParagrafos(texto);

    return {
      abertura: paragrafos.slice(0, 4).join("\n\n"),
      miolo: paragrafos.slice(Math.floor(paragrafos.length * 0.35), Math.floor(paragrafos.length * 0.35) + 4).join("\n\n"),
      encerramento: paragrafos.slice(-4).join("\n\n"),
      totalParagrafos: paragrafos.length
    };
  }

  function extrairLeituraDramatica(texto, personagens) {
    const t = texto.toLowerCase();

    let conflitoCentral = "Não conclusivo";
    if (/desaparec|investiga|hotel|sangue|por[aã]o|mist[eé]rio/.test(t)) {
      conflitoCentral = "Investigação de um ambiente ameaçador ou criminoso.";
    } else if (/roça|s[ií]tio|curral|vergonha|deboche|riso|influenciador/.test(t)) {
      conflitoCentral = "Choque entre mundos sociais com humilhação cômica e transformação.";
    } else if (/amor|paix[aã]o|saudade/.test(t)) {
      conflitoCentral = "Tensão afetiva ou amorosa dominando a narrativa.";
    }

    const protagonistas = personagens.slice(0, 2);
    const secundarios = personagens.slice(2, 6);

    return {
      protagonistas,
      secundarios,
      conflitoCentral
    };
  }

  function analisarObra(textoOriginal) {
    const textoBruto = normalizarTexto(textoOriginal || "");
    const textoLimpoInicial = limparEstruturaEditorial(textoBruto);
    const textoLimpo = prepararTextoParaLeitura(textoLimpoInicial);

    const estrutura = {
      titulo: detectarTitulo(textoLimpo),
      autor: detectarAutor(textoLimpo),
      capitulos: detectarCapitulos(textoLimpo)
    };

    const personagens = detectarPersonagens(textoLimpo);
    const tipo = detectarTipoObra(textoLimpo);
    const genero = detectarGenero(textoLimpo);
    const estilo = detectarEstilo(textoLimpo);
    const clima = detectarClima(textoLimpo);
    const narrador = detectarNarrador(textoLimpo);
    const blocos = montarBlocosSemanticos(textoLimpo);
    const leituraDramatica = extrairLeituraDramatica(textoLimpo, personagens);

    return {
      textoBruto,
      textoLimpo,
      estrutura,
      personagens,
      classificacao: {
        tipo,
        genero,
        estilo,
        clima,
        narrador
      },
      blocos,
      leituraDramatica
    };
  }

  global.LapidarLeituraEditorial = {
    normalizarTexto,
    limparEstruturaEditorial,
    analisarObra
  };
})(window);
