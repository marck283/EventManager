var impostPagina = () => {

	document.getElementById('navItem1').href = "";
	document.getElementById('navItem1').href = "CreazioneEvento" + ".html?token=" + TokenUser;

	document.getElementById('navItem2').href = "";
	document.getElementById('navItem2').href = "publicCalendar" + ".html?token=" + TokenUser;

	document.getElementById('navItem3').href = "";
	document.getElementById('navItem3').href = "calendarioPersonale" + ".html?token=" + TokenUser;




};


