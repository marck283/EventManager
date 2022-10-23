var dateEv = []; //array delle date possibli dell'evento

var aggiungi = () =>  { // funzione che mi permette di aggiungere una data per l'evento all'array "dataEv"
  var data = document.getElementById("date").value;
  console.log(data);
  if(data != "") {
    var date = new Date(), d1 = new Date(data);
    date.setHours(0, 0, 0, 0);
    if(d1 < date) {
      return;
    }
    data = data.split('/').join('-');
    if(!dateEv.includes(data)) {
      dateEv.push(data);
    }
  }
};

//funzione che mi permette di resettare le date elencate
var reset = () => {
  dateEv = [];
};
