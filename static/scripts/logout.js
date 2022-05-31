var logout = () => {
	
	localStorage.removeItem('token');

	window.location = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
	
}