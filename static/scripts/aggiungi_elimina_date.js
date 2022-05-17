dateEv = [];
ElencoDate = "";
var aggiungi = () =>  {
  
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



    
    document.getElementById("dates").innerHTML="[Date: " + ElencoDate + "]";

  }

}

var reset = () => {

  dateEv = [];
  ElencoDate = "";
  document.getElementById("dates").innerHTML="";


}



