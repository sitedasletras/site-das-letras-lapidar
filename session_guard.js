// SESSION GUARD • LAPIDAR

(function(){

const perfil = localStorage.getItem("lapidar_perfil")

if(!perfil){

window.location.href="index.html"
return

}

/* presença online */

localStorage.setItem(
"lapidar_online_timestamp",
Date.now()
)

})();
