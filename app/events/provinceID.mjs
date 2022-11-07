var map = province => {
    switch(province) {
        case "Agrigento": {
            return "AG";
        }
        case "Alessandria": {
            return "AL";
        }
        case "Ancona": {
            return "AN";
        }
        case "Aosta": {
            return "AO";
        }
        case "Arezzo": {
            return "AR";
        }
        case "Ascoli Piceno": {
            return "AP";
        }
        case "Asti": {
            return "AT";
        }
        case "Avellino": {
            return "AV";
        }
        case "Bari": {
            return "BA";
        }
        case "Barletta - Andria - Trani": {
            return "BT";
        }
        case "Belluno": {
            return "BL";
        }
        case "Benevento": {
            return "BN";
        }
        case "Bergamo": {
            return "BG";
        }
        case "Biella": {
            return "BI";
        }
        case "Bologna": {
            return "BO";
        }
        case "Bolzano": {
            return "BZ";
        }
        case "Brescia": {
            return "BS";
        }
        case "Brindisi": {
            return "BR";
        }
        case "Cagliari": {
            return "CA";
        }
        case "Caltanissetta": {
            return "CL";
        }
        case "Campobasso": {
            return "CB";
        }
        case "Carbonia-Iglesias": {
            return "CI";
        }
        case "Caserta": {
            return "CE";
        }
        case "Catania": {
            return "CT";
        }
        case "Catanzaro": {
            return "CZ";
        }
        case "Chieti": {
            return "CH";
        }
        case "Como": {
            return "CO";
        }
        case "Cosenza": {
            return "CS";
        }
        case "Cremona": {
            return "CR";
        }
        case "Crotone": {
            return "KR";
        }
        case "Cuneo": {
            return "CN";
        }
        case "Enna": {
            return "EN";
        }
        case "Fermo": {
            return "FM";
        }
        case "Ferrara": {
            return "FE";
        }
        case "Firenze": {
            return "FI";
        }
        case "Foggia": {
            return "FG";
        }
        case "Forlì-Cesena": {
            return "FC";
        }
    }
}

export default function provinceMap(province) {
    return map
}