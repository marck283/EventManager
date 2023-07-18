var logout = () => {
	localStorage.clear(); //La LocalStorage qui svuotata è locale alla pagina singola, non quella globale del browser.
	window.location = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
}