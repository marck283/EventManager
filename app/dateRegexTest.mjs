export function test(date, dateStr) {
    var regu;
    switch (String(date.getMonth() + 1).padStart(2, '0')) {
        case '01':
        case '03':
        case '05':
        case '07':
        case '08':
        case '10':
        case '12': {
            regu = /^(01|03|05|07|08|10|12)\-((1|2)0|3[0-1]|[0-2][1-9])\-[1-9]([0-9]{3})T([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
            break;
        }
        case '02': {
            if (date.getFullYear() % 400 == 0 || (date.getFullYear() % 4 == 0 && date.getFullYear() % 100 != 0)) {
                regu = /^02\-(20|[0-2][1-9])\-[1-9]([0-9]{3})T([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
            } else {
                regu = /^02\-(19|20|[0-2][1-8])\-[1-9]([0-9]{3})T([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
            }
            break;
        }
        case '04':
        case '06':
        case '09':
        case '11': {
            regu = /^(04|06|09|11)\-((1|2|3)0|[0-2][1-9])\-[1-9]([0-9]{3})T([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
            break;
        }
        default: {
            return false;
        }
    }
    return regu.test(dateStr);
}