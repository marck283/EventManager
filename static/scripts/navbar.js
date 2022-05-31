var createElem = (dest, id, link) => {
    var cev = document.createElement("a");
    cev.className = "nav-link";
    cev.setAttribute("id",link);
    cev.href = dest + ".html";
    document.getElementById(id).appendChild(cev);
  };

createElem("CreazioneEvento", "navItem1", "link1");
createElem("publicCalendar", "navItem2", "link2");
createElem("calendarioPersonale", "navItem3", "link3");