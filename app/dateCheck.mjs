export default function test(dateArr, hourStr) {
    var d = new Date(), ok = dateArr.filter(d1 => new Date(d1 + "Z" + hourStr) < d).length > 0 && dateArr.length == 1;
    d = null;
    return ok;
};