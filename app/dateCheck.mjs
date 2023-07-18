export default function test(luogoEv) {
    var d = new Date(), ok = luogoEv.filter(d1 => {
        var d2 = new Date(d1.data + "Z" + d1.ora) >= d;
        return d2;
    });
    d = null;
    return ok;
};