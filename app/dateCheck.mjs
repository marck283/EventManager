export default function test(dateArr, hourStr) {
    var i = 0;
    var d = new Date(), ok = dateArr.filter(d1 => {
        var j = i;
        var d2 = new Date(d1 + "Z" + hourStr[j]) < d;
        ++i;
        return d2;
    }).length > 0;
    d = null;
    return ok;
};