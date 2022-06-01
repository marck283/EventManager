guest = []; //array degli invitati possibli dell'evento

var aggiungiI = () =>  { 
  


    
  if(document.getElementById("invitati").value !=""){
    

    
    if(guest.includes(document.getElementById("invitati").value) == false){
    
        guest.push(document.getElementById("invitati").value);
        var elencoinv = "";
        for(elem of guest){
        if(elencoinv==""){
          elencoinv = elem;
        }else{
          elencoinv = elencoinv + "," + elem;
        }
      
        }
        
        document.getElementById("guests").innerHTML="[invitati: " + elencoinv + "]"; //Mostro l'elenco sulla pagina
      
      
          
    }



      
      

  }

}

var resetI = () => { //funzione che mi permette di resettare l'elenco degli invitati

  guest = [];

  document.getElementById("guests").innerHTML="";


}

