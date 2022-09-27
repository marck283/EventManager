var dateEv = []; //array delle  date possiibli dell'evento

var aggiungi = () =>  { // funzione che mi permette di aggiungere una data per l'evento all'array "dataEv"
  var data = document.getElementById("date").value;
  if(data != "") {
    var date = new Date(), mm = date.getMonth() + 1, dd = date.getDate(), yy = date.getFullYear();
    let dats = data.split('/');

    var giorno = dats[1].toString().padStart(2, '0'), mese = dats[0].toString().padStart(2, '0'), anno = dats[2];

    if(yy > Number(anno) || (yy == Number(anno) && (mm > Number(mese) || (mm == Number(mese) && dd > Number(giorno))))) {
      return;
    }

    data.split('/').join('-');
    if(!dateEv.includes(data)) {
      dateEv.push(data);
    }
  }
};

//funzione che mi permette di resettare le date elencate
var reset = () => {
  dateEv = [];
};
