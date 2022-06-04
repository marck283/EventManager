const request = require('supertest');
const jwt     = require('jsonwebtoken'); // used to create, sign, and verify tokens
const app     = require('../app.js');
const eventmap = require('../events/eventsMap.js')

describe('Funzionalità', () => {
 
  
  test('Mappaggio degli eventi per il calendario', async () => {

      const eventPublic = require('../collezioni/eventPublic.js');
      var evento1 = new eventPublic({data: "11/12/2023", durata: 2, ora: "11:13", maxPers: 4, categoria: "svago", nomeAtt: "Evento" , luogoEv: {indirizzo: "via panini", citta: "Trento"}, organizzatoreID: "23456789"})
      var evento2 = new eventPublic({data: "11/12/2023", durata: 2, ora: "11:13", maxPers: 4, categoria: "svago", nomeAtt: "Evento" , luogoEv: {indirizzo: "via panini", citta: "Trento"}, organizzatoreID: "23456789"})
      
      var eventi = [evento1,evento2];
      expect(eventmap.map(eventi,"pub")).toEqual([{id: "pub",
                    idevent: evento1._id,
                    self: "/api/v2/EventiPubblici/" + evento1._id,
                    name: "Evento",
                    category: "svago"},{id: "pub",
                    idevent: evento2._id,
                    self: "/api/v2/EventiPubblici/"+ evento2._id,
                    name: "Evento",
                    category: "svago"}]);
     
  });

  test('Verifica del formato di un email nel caso che si passi un versione errata', async () => {

      var verifica = (text) => {var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(text);}
      
      expect(verifica("ggaa@gmailcom")).toBe(false);
     
  });

  test('Verifica del formato di un email nel caso che si passi un versione corretta', async () => {

      var verifica = (text) => {var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(text);}
      
      expect(verifica("gg.aa@gmail.com")).toBe(true);
     
  });

  

});
