import User from '../collezioni/utenti.mjs';

export default function map(events, eventType, orgNames = null) {
    let i = 0;
    console.log(events);
    return events.map(event => {
        console.log(i);
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

        let obj = {
            id: eventType,
            idevent: event.id,
            self: apiUrl,
            name: event.nomeAtt,
            category: event.categoria,
            eventPic: event.eventPic,
            orgName: orgNames[i],
            days: event.data,
            hours: event.ora
        };
        console.log(orgNames[i]);

        i += 1;
        return obj;
    });
}