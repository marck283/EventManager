


var token = "";

if(localStorage.getItem('token') != null){

    token = localStorage.getItem('token');
}




fetch('../api/v1/Utenti/me/Inviti', {
		        method: 'GET',
		        headers: {
            		'x-access-token': token
        		}
		    	}).then((resp) => {
		    		
		    		/**if(resp.status==403 || resp.status==400){
		    			document.getElementById("iscrizione").innerHTML = "non iscritto";
		    		}
		    		if(resp.status==201){
		    			document.getElementById("iscrizione").innerHTML = "Iscritto " + "\n" + resp.headers;
		    		}
					*/
		    		
        			if(resp.status==200){
        				
        				resp.json().then(data => {


        					let paragrafo = document.getElementById("inviti");

        					for(elem of data){
        						


		                        let d = document.createElement("div");

		                        let tipo = document.createElement("h4");

		                        tipo.innerHTML = "Tipo Evento: "+elem.tipoevento;

		                        d.appendChild(tipo);

		                        let h1 = document.createElement("h4");

		                        h1.innerHTML = "Evento: " + elem.nomeAtt;

		                        d.appendChild(h1);

		                        let h2 = document.createElement("h4");

		                        h2.innerHTML = "Organizzatore: " + elem.nomeOrg;

		                        d.appendChild(h2);

		                        var h4 = document.createElement("h4");

		                      

		                        if(elem.accettato == true){

		                        	

		                        	h4.innerHTML = "già accettato"

		                        	d.appendChild(h4);


		                        }

		                        let h3 = document.createElement("h4");

		                        h3.innerHTML = "--------------------"


		                        d.appendChild(h3);

		                        

		                        paragrafo.appendChild(d)

		                    	
		                    	
		                        

		                    }



        				});


        			}
        			if(resp.status==403){
        				resp.json().then(data => {document.getElementById("error").innerHTML = data.error});
        				
        				

        			}
        			if(resp.status==500){
        				resp.json().then(data => {document.getElementById("error").innerHTML = data.error});

        			}
        			if(resp.status==404){
        				resp.json().then(data => {document.getElementById("error").innerHTML = data.error});

        			}
        			if(resp.status==401){
        				resp.json().then(data => {document.getElementById("error").innerHTML = data.message});

        			}

        			return;
    			}).catch( error => console.error(error) ); // If there is any error you will catch them here

		


