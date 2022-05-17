dateEv = []; //array delle  date possiibli dell'evento
ElencoDate = ""; //L'elenco delle date a cui un evento si è programmato
var aggiungi = () =>  { // funzione che mi permette di aggiungere una data per l'evento all'elenco "ElencoDate" e all'array "dataEv"
  
  if(document.getElementById("date").value !=""){
    dateEv.push(document.getElementById("date").value);
    ElencoDate = "";
    for(elem of dateEv){
      if(ElencoDate==""){
        ElencoDate = elem;
      }else{
        ElencoDate = ElencoDate + "," + elem;
      }
    
        
    }



    
    document.getElementById("dates").innerHTML="[Date: " + ElencoDate + "]"; //Mostro l'elenco sulla pagina

  }

}

var reset = () => { //funzione che mi permette di resettare le date elencates

  dateEv = [];
  ElencoDate = "";
  document.getElementById("dates").innerHTML="";


}



