


fetch('../api/v2/Utenti/me/Iscrizioni', {method: 'GET', headers: {'x-access-token': token}})
    .then(resp => {

        switch(resp.status){
            case 200: {
                resp.json().then(resp => {

                    var paragrafo = document.getElementById("biglietti");

                    for(elem of resp){



                        let d = document.createElement("div");

                        let tipo = document.createElement("h4");

                        tipo.innerHTML = "Tipo Evento: ";
                        switch(elem.tipoevento) {
                            case "pub": {
                                tipo.innerHTML += "pubblico";
                                break;
                            }
                            case "priv": {
                                tipo.innerHTML += "privato";
                                break;
                            }
                            default: {
                                tipo.innerHTML += "tipo evento non riconosciuto";
                                break;
                            }
                        }

                        d.appendChild(tipo);

                        let h1 = document.createElement("h4");

                        h1.innerHTML = "Evento: " + elem.nomeAtt;

                        d.appendChild(h1);

                        let h2 = document.createElement("h4");

                        h2.innerHTML = "Organizzatore: " + elem.nomeOrg;

                        d.appendChild(h2);

                        let img = document.createElement("img");

                        let img_b64 = elem.img;

                        let png = img_b64.split(',')[1];

                        let the_file = new Blob([window.atob(png)],  {type: 'image/png', encoding: 'utf-8'});

                        let fr = new FileReader();
                        fr.onload = function ( oFREvent ) {
                            let v = oFREvent.target.result.split(',')[1]; // encoding is messed up here, so we fix it
                            v = atob(v);
                            let good_b64 = btoa(decodeURIComponent(escape(v)));
                            img.src = "data:image/png;base64," + good_b64;
                        };
                        fr.readAsDataURL(the_file);

                        d.appendChild(img);

                        let pulsante = document.createElement("button");
                        pulsante.textContent = "Disiscrizione";
                        pulsante.classList = "btn btn-primary";

                        if(elem.tipoevento == "pub"){
                            

                            pulsante.onclick = disiscrPub.bind(this,elem.eventoid,elem.bigliettoid) //*************************************************************************
                        
                        }else{

                            pulsante.onclick = disiscrPriv.bind(this,elem.eventoid,elem.bigliettoid) //*************************************************************************


                        }

                        d.appendChild(pulsante)

                        



                        let h3 = document.createElement("h4");

                        h3.innerHTML = "--------------------"


                        d.appendChild(h3);

                        

                        paragrafo.appendChild(d)
                        

                    }
                    
                });
                break;
            }
            case 403:
            case 404:
            case 500: {
                resp.json().then(data => {document.getElementById("error2").textContent = data.error});
                break;
            }
            case 401:{
                resp.json().then(data => {document.getElementById("error2").textContent = data.message});
                break;
            }
            default: {
                console.log(resp.status);
            }
        }
    })
    .catch( error => console.error(error) );