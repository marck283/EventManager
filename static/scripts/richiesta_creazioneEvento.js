var requestPu = () => { //funzione che mi permette di fare i vari controlli delle info per creare un certo evento pubblico date 
    //in input nella pagina e poi mi permette di fare un richiesta ajax al server. La risposta la gestisco stampandomi il percorso per quella risorsa
    var inviare = true
    if(ElencoDate==""){
        document.getElementById("vuotoDa").innerHTML="inserire una data";
        inviare=false;
    }else{
        document.getElementById("vuotoDa").innerHTML="";
    }
    if(document.getElementById("ora").value==""){

        document.getElementById("vuotoO").innerHTML="inserire Ora";
        inviare=false;
    }else{
        var reg= /([0-9]+):([0-9]+)/
        if(reg.test(document.getElementById("ora").value)){
            strin=document.getElementById("ora").value.split(":");
            if(strin.length>2){
                document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
                inviare=false;
            }else{
                if(strin[0].length==2 && strin[1].length==2) {
                    str1 = strin[0];
                    str2 = strin[1];
                    if(strin[0][0]==0){
                        str1=strin[0][1];

                    }
                    if(strin[1][0]==0){
                        str2=strin[1][1];
                    }
                    if(Number(str1)<=23 && Number(str1)>=0 && Number(str2)<=59 && Number(str2)>=0){
                        var d = new Date()

                        if(ElencoDate != ""){
                                var mm = d.getMonth() + 1
                                var dd = d.getDate()
                                var yy = d.getFullYear()

                                var giorno = ""
                                var mese = ""

                                if(dd < 10){

                                    giorno = "0" + dd;

                                }else{

                                    giorno = "" + dd;
                                }

                                if(mm < 10){

                                    mese = "0" + mm;

                                }else{

                                    mese = "" + mm;
                                }

                                var anno = "" + yy;

                                var temp_poz = mese + '/' + giorno + '/' + anno;

                                if(ElencoDate.includes(temp_poz) == true){


                                    if(Number(str1) >= d.getHours()){
                            
                         
                            if(Number(str1) == d.getHours()){

                                

                                if(Number(str2) >= d.getMinutes()){

                                        document.getElementById("vuotoO").innerHTML="";


                                }else{
                                    document.getElementById("vuotoO").innerHTML="Inserisci orario corretto";
                                    inviare=false;

                                }


                            }else{

                                document.getElementById("vuotoO").innerHTML="";

                            }


                        }else{
                            document.getElementById("vuotoO").innerHTML="Inserisci orario corretto";
                            inviare=false;

                        }



                                }


                        }
                    
                        
     

                    }else{
                        document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
                        inviare=false;
                    }


                    
                }else{
                    document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
                    inviare=false;
                }
            }
            

        }else{
            document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
            inviare=false;
        }
        
    }
    if(document.getElementById("nomeAtt").value==""){
        document.getElementById("vuotoN").innerHTML="inserire nome attività";
        inviare=false;
    }else{
        document.getElementById("vuotoN").innerHTML="";
    }
    if(document.getElementById("indirizzo").value==""){
        document.getElementById("vuotoI").innerHTML="inserire indirizzo";
        inviare=false;
    }else{
        document.getElementById("vuotoI").innerHTML="";
    }
    if(document.getElementById("Citta").value==""){
        document.getElementById("vuotoCi").innerHTML="inserire città";
        inviare=false;
    }else{
        document.getElementById("vuotoCi").innerHTML="";
    }
    if(inviare==true){

        var Token = token
        var reqObj = new XMLHttpRequest(), eventJSONList;
        reqObj.open("Post", "/api/v1/EventiPubblici", true); //Invio una richiesta asincrona al server Node.js
        reqObj.setRequestHeader('Content-Type', 'application/json');
        reqObj.setRequestHeader('x-access-token', Token);
        reqObj.responseType = "json";
        reqObj.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 201) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
                locazione=this.getResponseHeader("Location")
                document.getElementById("loc").innerHTML = "Creato evento pubblico"
                
            }
            if (this.readyState === 4 && this.status === 500) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
                locazione=this.getResponseHeader("Location")
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
            if (this.readyState === 4 && this.status === 404) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
               
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }

            if (this.readyState === 4 && this.status === 403) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
            if (this.readyState === 4 && this.status === 401) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.message
                
            }
            if (this.readyState === 4 && this.status === 400) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
    };
    

    
        reqObj.send(JSON.stringify({ "data": ElencoDate, "ora": document.getElementById("ora").value, "durata": Number(document.getElementById("durata").value), "maxPers": Number(document.getElementById("maxPers").value),"categoria": document.getElementById("categoria").value, "nomeAtt": document.getElementById("nomeAtt").value, "luogoEv": {"indirizzo": document.getElementById("indirizzo").value, "citta": document.getElementById("Citta").value}}))
    }   

};

//funzione che mi permette di fare i vari controlli delle info per creare un certo evento personale date 
//in input nella pagina e poi mi permette di fare un richiesta ajax al server. La risposta la gestisco stampandomi il percorso per quella risorsa

var requestPe = () => {
    //reqObj.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    var inviare = true
    if(ElencoDate==""){
        document.getElementById("vuotoDa").innerHTML="inserire una data";
        inviare=false;
    }else{
        document.getElementById("vuotoDa").innerHTML="";
    }
    if(document.getElementById("ora").value==""){

        document.getElementById("vuotoO").innerHTML="inserire Ora";
        inviare=false;
    }else{
        var reg= /([0-9]+):([0-9]+)/
        if(reg.test(document.getElementById("ora").value)){
            strin=document.getElementById("ora").value.split(":");
            if(strin.length>2){
                document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
                inviare=false;
            }else{
                if(strin[0].length==2 && strin[1].length==2) {
                    str1 = strin[0];
                    str2 = strin[1];
                    if(strin[0][0]==0){
                        str1=strin[0][1];

                    }
                    if(strin[1][0]==0){
                        str2=strin[1][1];
                    }
                    if(Number(str1)<=23 && Number(str1)>=0 && Number(str2)<=59 && Number(str2)>=0){
                         var d = new Date()

                        if(ElencoDate != ""){
                                var mm = d.getMonth() + 1
                                var dd = d.getDate()
                                var yy = d.getFullYear()

                                var giorno = ""
                                var mese = ""

                                if(dd < 10){

                                    giorno = "0" + dd;

                                }else{

                                    giorno = "" + dd;
                                }

                                if(mm < 10){

                                    mese = "0" + mm;

                                }else{

                                    mese = "" + mm;
                                }

                                var anno = "" + yy;

                                var temp_poz = mese + '/' + giorno + '/' + anno;

                                if(ElencoDate.includes(temp_poz) == true){


                                    if(Number(str1) >= d.getHours()){
                            
                         
                            if(Number(str1) == d.getHours()){

                                

                                if(Number(str2) >= d.getMinutes()){

                                        document.getElementById("vuotoO").innerHTML="";


                                }else{
                                    document.getElementById("vuotoO").innerHTML="Inserisci orario corretto";
                                    inviare=false;

                                }


                            }else{

                                document.getElementById("vuotoO").innerHTML="";

                            }


                        }else{
                            document.getElementById("vuotoO").innerHTML="Inserisci orario corretto";
                            inviare=false;

                        }



                                }


                        }
                    

                    }else{
                        document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
                        inviare=false;
                    }
                    
                }else{
                    document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
                    inviare=false;
                }
            }
            

        }else{
            document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
            inviare=false;
        }
        
    }
    if(document.getElementById("nomeAtt").value==""){
        document.getElementById("vuotoN").innerHTML="inserire nome attività";
        inviare=false;
    }else{
        document.getElementById("vuotoN").innerHTML="";
    }
    if(document.getElementById("indirizzo").value==""){
        document.getElementById("vuotoI").innerHTML="inserire indirizzo";
        inviare=false;
    }else{
        document.getElementById("vuotoI").innerHTML="";
    }
    if(document.getElementById("Citta").value==""){
        document.getElementById("vuotoCi").innerHTML="inserire città";
        inviare=false;
    }else{
        document.getElementById("vuotoCi").innerHTML="";
    }
    if(inviare==true){
        Token = token
        var reqObj = new XMLHttpRequest(), eventJSONList;
        reqObj.open("Post", "/api/v1/EventiPersonali", true); //Invio una richiesta asincrona al server Node.js
        reqObj.setRequestHeader('Content-Type', 'application/json');
        reqObj.setRequestHeader('x-access-token', Token);
        reqObj.responseType = "json";
        reqObj.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 201) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
                locazione=this.getResponseHeader("Location")
                document.getElementById("loc").innerHTML = "Creato evento personale"
                
            }
            if (this.readyState === 4 && this.status === 500) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
                locazione=this.getResponseHeader("Location")
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
            if (this.readyState === 4 && this.status === 404) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
            if (this.readyState === 4 && this.status === 403) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
            if (this.readyState === 4 && this.status === 401) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.message
                
            }
            if (this.readyState === 4 && this.status === 400) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
    };
        
    
        reqObj.send(JSON.stringify({ "data": ElencoDate, "ora": document.getElementById("ora").value, "durata": Number(document.getElementById("durata").value),"categoria": document.getElementById("categoria").value, "nomeAtt": document.getElementById("nomeAtt").value, "luogoEv": {"indirizzo": document.getElementById("indirizzo").value, "citta": document.getElementById("Citta").value}}))
    }   

};


var requestPr = () => {
    //reqObj.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    var inviare = true
    if(guest.length == 0){
        document.getElementById("vuotoIn").innerHTML="inserire invitato";
        inviare=false;
    }else{
        document.getElementById("vuotoIn").innerHTML="";
    }
    if(ElencoDate==""){
        document.getElementById("vuotoDa").innerHTML="inserire una data";
        inviare=false;
    }else{
        document.getElementById("vuotoDa").innerHTML="";
    }
    if(document.getElementById("ora").value==""){

        document.getElementById("vuotoO").innerHTML="inserire Ora";
        inviare=false;
    }else{
        var reg= /([0-9]+):([0-9]+)/
        if(reg.test(document.getElementById("ora").value)){
            strin=document.getElementById("ora").value.split(":");
            if(strin.length>2){
                document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
                inviare=false;
            }else{
                if(strin[0].length==2 && strin[1].length==2) {
                    str1 = strin[0];
                    str2 = strin[1];
                    if(strin[0][0]==0){
                        str1=strin[0][1];

                    }
                    if(strin[1][0]==0){
                        str2=strin[1][1];
                    }
                    if(Number(str1)<=23 && Number(str1)>=0 && Number(str2)<=59 && Number(str2)>=0){
                         var d = new Date()

                        if(ElencoDate != ""){
                                var mm = d.getMonth() + 1
                                var dd = d.getDate()
                                var yy = d.getFullYear()

                                var giorno = ""
                                var mese = ""

                                if(dd < 10){

                                    giorno = "0" + dd;

                                }else{

                                    giorno = "" + dd;
                                }

                                if(mm < 10){

                                    mese = "0" + mm;

                                }else{

                                    mese = "" + mm;
                                }

                                var anno = "" + yy;

                                var temp_poz = mese + '/' + giorno + '/' + anno;

                                if(ElencoDate.includes(temp_poz) == true){


                                    if(Number(str1) >= d.getHours()){
                            
                         
                            if(Number(str1) == d.getHours()){

                                

                                if(Number(str2) >= d.getMinutes()){

                                        document.getElementById("vuotoO").innerHTML="";


                                }else{
                                    document.getElementById("vuotoO").innerHTML="Inserisci orario corretto";
                                    inviare=false;

                                }


                            }else{

                                document.getElementById("vuotoO").innerHTML="";

                            }


                        }else{
                            document.getElementById("vuotoO").innerHTML="Inserisci orario corretto";
                            inviare=false;

                        }



                                }


                        }
                    

                    }else{
                        document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
                        inviare=false;
                    }
                    
                }else{
                    document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
                    inviare=false;
                }
            }
            

        }else{
            document.getElementById("vuotoO").innerHTML="formato ora: hh:mm";
            inviare=false;
        }
        
    }
    if(document.getElementById("nomeAtt").value==""){
        document.getElementById("vuotoN").innerHTML="inserire nome attività";
        inviare=false;
    }else{
        document.getElementById("vuotoN").innerHTML="";
    }
    if(document.getElementById("indirizzo").value==""){
        document.getElementById("vuotoI").innerHTML="inserire indirizzo";
        inviare=false;
    }else{
        document.getElementById("vuotoI").innerHTML="";
    }
    if(document.getElementById("Citta").value==""){
        document.getElementById("vuotoCi").innerHTML="inserire città";
        inviare=false;
    }else{
        document.getElementById("vuotoCi").innerHTML="";
    }
    if(inviare==true){
        Token = token
        var reqObj = new XMLHttpRequest(), eventJSONList;
        reqObj.open("Post", "/api/v1/EventiPrivati", true); //Invio una richiesta asincrona al server Node.js
        reqObj.setRequestHeader('Content-Type', 'application/json');
        reqObj.setRequestHeader('x-access-token', Token);
        reqObj.responseType = "json";
        reqObj.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 201) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
                locazione=this.getResponseHeader("Location")
                document.getElementById("loc").innerHTML = "Creato evento privato"
                
            }
            if (this.readyState === 4 && this.status === 500) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
                locazione=this.getResponseHeader("Location")
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
            if (this.readyState === 4 && this.status === 404) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
            if (this.readyState === 4 && this.status === 403) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
            if (this.readyState === 4 && this.status === 401) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.message
                
            }
            if (this.readyState === 4 && this.status === 400) {
                console.log("ricevuto")
                //Popola la pagina con i dati ricevuti
                eventJSONList = this.response; //Cattura la risposta in formato JSON
              
                document.getElementById("loc").innerHTML = eventJSONList.error
                
            }
    };
        
    
        reqObj.send(JSON.stringify({ "data": ElencoDate, "ora": document.getElementById("ora").value, "durata": Number(document.getElementById("durata").value),"categoria": document.getElementById("categoria").value, "nomeAtt": document.getElementById("nomeAtt").value, "luogoEv": {"indirizzo": document.getElementById("indirizzo").value, "citta": document.getElementById("Citta").value}, ElencoEmailInviti: guest}))
    }   

};

