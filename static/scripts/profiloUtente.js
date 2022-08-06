
var token = "";

if(localStorage.getItem('token') != null){

    token = localStorage.getItem('token');
}



fetch('../api/v2/Utenti/me', {method: 'GET', headers: {'x-access-token': token}})
    .then(resp => {

        switch(resp.status){
            case 200: {
                resp.json().then(resp => {
                    let nome = document.getElementById("nome");
                    nome.textContent = resp.nome;
                    let email = document.getElementById("email");
                    email.textContent = resp.email;
                    let tel = document.getElementById("tel");
                    if(resp.tel != "") {
                        tel.textContent = resp.tel;
                    } else {
                        tel.textContent = "Non impostato.";
                    }

                    let password = document.getElementById("password");
                    password.textContent = resp.password;
                });
                break;
            }
            case 403:
            case 404:
            case 500: {
                resp.json().then(data => {document.getElementById("error").textContent = data.error});
                break;
            }
            case 401:{
                resp.json().then(data => {document.getElementById("error").textContent = data.message});
                break;
            }
            default: {
                console.log(resp.status);
            }
        }
    })
    .catch( error => console.error(error) );




