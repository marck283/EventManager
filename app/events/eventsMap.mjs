export default function map(events, eventType, orgNames = null) {
    let i = 0;
    return events.map(event => {
        var apiUrl;
        switch (eventType) {
            case "pers": {
                apiUrl = "/api/v2/EventiPersonali/" + event.id;
                break;
            }
            case "pub": {
                apiUrl = "/api/v2/EventiPubblici/" + event.id;
                break;
            }
            case "priv": {
                apiUrl = "/api/v2/EventiPrivati/" + event.id;
                break;
            }
            default: {
                //This should never happen
                return {};
            }
        }

        let luogoEv = event.luogoEv;
        for (let i = 0; i < luogoEv.length; i++) {
            if(eventType == "pub") {
                const numPostiRimanenti = luogoEv[i].maxPers - luogoEv[i].partecipantiID.length;
                luogoEv[i].numPostiRimanenti = numPostiRimanenti;
            } else {
                if(eventType == "priv") {
                    delete luogoEv[i].invitatiID;
                }
                luogoEv[i].numPostiRimanenti = 0;
            }
            delete luogoEv[i].partecipantiID;
        }

        let obj = {
            id: eventType,
            idevent: event.id,
            self: apiUrl,
            name: event.nomeAtt,
            category: event.categoria,
            eventPic: event.eventPic,
            orgName: orgNames[i],
            luogoEv: luogoEv
        };

        i += 1;

        return obj;
    });
}