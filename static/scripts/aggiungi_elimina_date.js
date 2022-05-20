dateEv = []; //array delle  date possiibli dell'evento
ElencoDate = ""; //L'elenco delle date a cui un evento si è programmato
var aggiungi = () =>  { // funzione che mi permette di aggiungere una data per l'evento all'elenco "ElencoDate" e all'array "dataEv"
  


    
  if(document.getElementById("date").value !=""){
    var data = document.getElementById("date").value;
    var date = new Date();
    var mm = date.getMonth() + 1
    var dd = date.getDate()
    var yy = date.getFullYear()
    dats = data.split('/');

   
    if(dats[0][0] == '0'){

      mese = dats[0][1];

    }else{

      mese = dats[0];

    }


    if(dats[1][0] == '0'){

      giorno = dats[1][1];

    }else{

      giorno = dats[1];

    }

    anno = dats[2]

   

    if(yy > Number(anno)){

      return;

    }else{

   
      if(yy == Number(anno)){
       

        if(mm > Number(mese)){
          return;
         
        }else{

          if(mm == Number(mese)){
         

            if(dd > Number(giorno)){
              return;

            }

          }
       

        }

      }

    }

    
    if(ElencoDate.includes(document.getElementById("date").value) == false){
    
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

}

var reset = () => { //funzione che mi permette di resettare le date elencates

  dateEv = [];
  ElencoDate = "";
  document.getElementById("dates").innerHTML="";


}



