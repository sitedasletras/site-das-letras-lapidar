function SDL_definirPlanoSetor(setor, plano, validadeDias){

const hoje = new Date()

const validade = new Date()
validade.setDate(hoje.getDate() + validadeDias)

const dadosPlano = {
setor: setor,
plano: plano,
inicio: hoje.toISOString(),
validade: validade.toISOString(),
ativo: true
}

localStorage.setItem(
"SDL_plano_" + setor,
JSON.stringify(dadosPlano)
)

SDL_registrarAuditoria(
"Plano ativado no setor " + setor,
"planos_usuario"
)

}


function SDL_definirPlanoAvulso(setor){

const registro = {
setor: setor,
data: new Date().toISOString(),
tipo: "avulso"
}

localStorage.setItem(
"SDL_avulso_" + setor,
JSON.stringify(registro)
)

SDL_registrarAuditoria(
"Uso avulso registrado no setor " + setor,
"planos_usuario"
)

}


function SDL_planoAtivo(setor){

const dados = JSON.parse(
localStorage.getItem("SDL_plano_" + setor)
)

if(!dados) return false

const hoje = new Date()
const validade = new Date(dados.validade)

return hoje <= validade

}


function SDL_statusSetor(setor){

if(SDL_planoAtivo(setor)){

return "plano"

}

const avulso = localStorage.getItem(
"SDL_avulso_" + setor
)

if(avulso){

return "avulso"

}

return "bloqueado"

}
