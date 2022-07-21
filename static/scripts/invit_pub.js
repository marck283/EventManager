var invip = () => {
			
			
			
			

			let email = document.getElementById("posta").value; 
			console.log(email)

			fetch('../api/v2/EventiPubblici/' + id + '/Inviti', {
		        method: 'POST',
		        headers:{
            		'x-access-token': token,
            		'Content-Type': 'application/json'
        		},
        		body: JSON.stringify({email: email})
		    	}).then((resp) => {
		    		
		    		/**if(resp.status==403 || resp.status==400){
		    			document.getElementById("iscrizione").innerHTML = "non iscritto";
		    		}
		    		if(resp.status==201){
		    			document.getElementById("iscrizione").innerHTML = "Iscritto " + "\n" + resp.headers;
		    		}
					*/
		    		
        			if(resp.status==201){
        				document.getElementById("invitip").innerHTML = "Invitato"
        			}
        			if(resp.status==403 || resp.status == 500 || resp.status == 404 || resp.status == 400){
        				resp.json().then(data => {document.getElementById("invitip").innerHTML = data.error});
        			}
        			if(resp.status==401){
        				resp.json().then(data => {document.getElementById("invitip").innerHTML = data.message});
        			}

        			return;
    			}).catch( error => console.error(error) ); // If there is any error you will catch them here

		}