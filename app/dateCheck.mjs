export default function test(data, ora) {
    var d = new Date(), ok = luogoEv.filter(d1 => {
        var d2 = new Date(data + "Z" + ora) >= d;
        return d2;
    });
    d = null;
    return ok;
};