
fetch('../api/v1/Utente/me/inviti', {
		        method: 'GET',
		        headers: {
            		'x-access-token': token
        		}
		    	}).then((resp) => {
		    		console.log(resp);
		    		/**if(resp.status==403 || resp.status==400){
		    			document.getElementById("iscrizione").innerHTML = "non iscritto";
		    		}
		    		if(resp.status==201){
		    			document.getElementById("iscrizione").innerHTML = "Iscritto " + "\n" + resp.headers;
		    		}
					*/
		    		
        			if(resp.status==200){
        				
        				resp.json().then(data => {


        					for(var elem of data){
        						let document.getElementById("error").innerHTML



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

		}


