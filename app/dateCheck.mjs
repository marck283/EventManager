export default function test(luogoEv) {
    var d = new Date(), ok = luogoEv.filter(d1 => {
        var d2 = new Date(luogoEv.data + "Z" + luogoEv.ora) >= d;
        return d2;
    });
    d = null;
    return ok;
};