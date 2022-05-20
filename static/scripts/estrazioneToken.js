let url = window.location.href;
var token = "6284b7742a0699866a636979"; //Valore di esempio
try {
    url=url.split('?');
    url=url[1].split('=');
    token = url[1];
} catch(error) {
    console.log(error);
}
