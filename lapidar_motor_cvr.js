// MOTOR CVR DIAGRAMAÇÃO + OKAPISTA (COMPLETO)

const LapidarCVR = {

// ======================
// CONFIGURAÇÃO BASE
// ======================

fontes = {
"Times New Roman":0.00,
"Arial":0.08,
"Garamond":0.12
};

extrasDiagramacao = {
capitular:0.05,
separadorCapitulo:0.07,
numeracaoEspecial:0.06,
moldura:0.10,
imagemNanquim:0.15,
imagemCinemaPB:0.18,
paginaPreta:0.25
};

extrasCapista = {
capaPremium:0.20,
capaInternacional:0.25,
capaHibrida:0.15
};

// ======================
// FUNÇÃO DIAGRAMAÇÃO
// ======================

calcularDiagramacao(config){

let valor = config.base || 3.99;

if(config.fonte){

valor += this.fontes[config.fonte] || 0;

}

for(let item in config.extras){

if(config.extras[item]){

valor += this.extrasDiagramacao[item] || 0;

}

}

return valor;

}

// ======================
// FUNÇÃO CAPISTA
// ======================

calcularCapista(config){

let valor = config.base || 3.99;

for(let item in config.extras){

if(config.extras[item]){

valor += this.extrasCapista[item] || 0;

}

}

return valor;

}

};
