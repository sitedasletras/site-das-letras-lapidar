(function () {

const sessao = localStorage.getItem("lapidar_sessao_ativa");
const usuario = localStorage.getItem("lapidar_usuario");
const perfil = localStorage.getItem("lapidar_perfil");

if(sessao !== "true" || !usuario || !perfil){

window.location.replace("login.html");

}

})();
