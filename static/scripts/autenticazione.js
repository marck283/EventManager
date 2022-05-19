





var login = () => {

	
 
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;


    fetch('../api/v1/authentications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { email: email, password: password } ),
    })
    .then((resp) => {

        console.log(resp);
        /**if(resp.status==403 || resp.status==400){
            document.getElementById("iscrizione").innerHTML = "non iscritto";
        }
        if(resp.status==201){
            document.getElementById("iscrizione").innerHTML = "Iscritto " + "\n" + resp.headers;
        }
        */
        
        if(resp.status==404){
            resp.json().then(data => {document.getElementById("usr").innerHTML = data.message});

        }
        if(resp.status==403){
            resp.json().then(data => {document.getElementById("usr").innerHTML = data.message});
            
            

        }
        if(resp.status==200){
            resp.json().then(data => {document.getElementById("usr").innerHTML = data.message; 
            TokenUser = data.token;
            
            impostPagina();});

        }
        

        return;}).catch( error => console.error(error) ); // If there is any error you will catch them here



	};




