// MOTOR CENTRAL DE CÁLCULO LAPIDAR v2 (COMPLETO)

const LapidarCalculo = {

calcularProjeto(config){

let total = 0;
let itens = [];

// ======================
// AVALIAÇÃO LITERÁRIA
// ======================

if(config.modulos?.avaliacao){

let qtd = config.avaliacao?.quantidadeModulos || 1;

let valor = 25;

if(qtd == 2) valor = 35;
if(qtd == 3) valor = 45;
if(qtd >= 4) valor = 55;

total += valor;

itens.push({
modulo:"Avaliação Literária",
valor:valor
});

}

// ======================
// TRADUÇÃO
// ======================

if(config.modulos?.traducao){

let idiomas = config.traducao?.quantidadeIdiomas || 1;

let valor = idiomas * 25;

total += valor;

itens.push({
modulo:"Segunda Língua(s)",
valor:valor
});

}

// ======================
// LAPIDAÇÃO LITERÁRIA
// ======================

if(config.modulos?.lapidacao){

total += 25;

itens.push({
modulo:"Lapidação Literária",
valor:25
});

}

// ======================
// ANALISADOR DE OBRA
// ======================

if(config.modulos?.analisador){

let paginas = config.analisador?.nivel || 4;

let valor = 25;

if(paginas == 6) valor = 35;
if(paginas == 8) valor = 45;
if(paginas == 11) valor = 55;

total += valor;

itens.push({
modulo:"Analisador de Obra",
valor:valor
});

}

// ======================
// SILO SONORO
// ======================

if(config.modulos?.silo){

total += 630;

itens.push({
modulo:"Silo Sonoro",
valor:630
});

}

// ======================
// RESULTADO FINAL
// ======================

return {

itens:itens,
total:total,
totalFormatado:"R$ " + total.toFixed(2).replace(".",",")

};

}

};
