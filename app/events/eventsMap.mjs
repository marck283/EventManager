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

        var luogoEv = event.luogoEv;
        for (let i = 0; i < luogoEv.length; i++) {
            if(eventType == "pub") {
                luogoEv[i].numPostiRimanenti = luogoEv[i].maxPers - luogoEv[i].partecipantiID.length;
            } else {
                luogoEv[i].numPostiRimanenti = 0;
            }
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

        console.log("obj:", obj.luogoEv[0].numPostiRimanenti);
        i += 1;

        return obj;
    });
}