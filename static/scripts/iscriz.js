var iscr = () => {
			id = '62834b33c1f3bac3f8c5b55f'
			token = "frgrgtgrt"
			

			fetch('../api/v1/EventiPubblici/' + id + '/Iscrizioni', {
		        method: 'POST',
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
		    		
        			if(resp.status==201){
        				document.getElementById("iscrizione").innerHTML = "Iscritto"

        			}
        			if(resp.status==403){
        				resp.json().then(data => {document.getElementById("iscrizione").innerHTML = data.error});
        				
        				

        			}
        			if(resp.status==500){
        				resp.json().then(data => {document.getElementById("iscrizione").innerHTML = data.error});

        			}
        			if(resp.status==404){
        				resp.json().then(data => {document.getElementById("iscrizione").innerHTML = data.error});

        			}
        			if(resp.status==401){
        				resp.json().then(data => {document.getElementById("iscrizione").innerHTML = data.error});

        			}

        			return;
    			}).catch( error => console.error(error) ); // If there is any error you will catch them here

		}