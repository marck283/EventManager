module.exports = {
    test: function(date, dateStr) {
        switch (String(date.getMonth() + 1).padStart(2, '0')) {
            case '01':
            case '03':
            case '05':
            case '07':
            case '08':
            case '10':
            case '12': {
                regu = /^(01|03|05|07|08|10|12)\/(20|3[0-1]|[0-2][1-9])\/[1-9]([0-9]{3})$/;
                break;
            }
            case '02': {
                regu = /^02\/(19|20|[0-2][1-8])\/[1-9]([0-9]{3})$/;
                break;
            }
            case '04':
            case '06':
            case '09':
            case '11': {
                regu = /^(04|06|09|11)\/(10|20|30|[0-2][1-9])\/[1-9]([0-9]{3})$/;
                break;
            }
            default: {
                return false;
            }
        }
        return regu.test(dateStr);
    }
}