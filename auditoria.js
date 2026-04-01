// ===============================
// MÓDULO DE AUDITORIA EDITORIAL
// Sistema Lapidar — Site das Letras
// ===============================

function SDL_registrarAuditoria(acao, modulo){

try{

const usuario =
localStorage.getItem("SDL_usuario") || "usuario_desconhecido"

const projetoID =
localStorage.getItem("SDL_projeto_ativo") || "sem_projeto"

let listaProjetos =
JSON.parse(localStorage.getItem("SDL_projetos_lista") || "[]")

let projetoTitulo = "sem_projeto"

const projeto = listaProjetos.find(
p => p.id === projetoID
)

if(projeto){

projetoTitulo = projeto.titulo

}

let logs =
JSON.parse(localStorage.getItem("SDL_auditoria_logs") || "[]")

logs.push({

usuario,
acao,
modulo,
projetoID,
projetoTitulo,
data:new Date().toISOString()

})

localStorage.setItem(
"SDL_auditoria_logs",
JSON.stringify(logs)
)

}catch(e){

console.warn("Falha auditoria:", e)

}

}
