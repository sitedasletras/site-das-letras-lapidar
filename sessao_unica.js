function SDL_gerarTokenSessao(){

return Date.now() + "_" + Math.random().toString(36).substring(2)

}


function SDL_iniciarSessao(usuario){

const token = SDL_gerarTokenSessao()

localStorage.setItem("SDL_usuario", usuario)

localStorage.setItem("SDL_token_sessao", token)

localStorage.setItem("SDL_sessao_ativa", "sim")

localStorage.setItem("SDL_sessao_inicio", new Date().toISOString())

return token

}


function SDL_validarSessao(){

const ativa = localStorage.getItem("SDL_sessao_ativa")

if(ativa !== "sim"){

window.location.href = "login.html"

return false

}

return true

}


function SDL_encerrarSessao(){

localStorage.removeItem("SDL_sessao_ativa")

localStorage.removeItem("SDL_token_sessao")

window.location.href = "login.html"

}


function SDL_forcarSessaoUnica(tokenAtual){

const tokenLocal = localStorage.getItem("SDL_token_sessao_global")

if(tokenLocal && tokenLocal !== tokenAtual){

alert(
"Sua conta foi acessada em outro dispositivo. Esta sessão será encerrada."
)

SDL_encerrarSessao()

return

}

localStorage.setItem("SDL_token_sessao_global", tokenAtual)

}
