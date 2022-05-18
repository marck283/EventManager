





var login = () => {

	
 
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;


    fetch('../api/v1/authentications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { email: email, password: password } ),
    })
    .then((resp) => resp.json())
    .then(function(data) { 

        TokenUser = data.token;
        console.log(data);
        
        document.getElementById("usr").innerHTML = data.self;
        impostPagina();

        
        return;
    })
    .catch( error => console.error(error) ); // If there is any error you will catch them here



	};




