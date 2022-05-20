let url = window.location.href;
var token = "asasasas";
try {
    url = url.split('?');
    url = url[1].split('=');
    token = url[1];
} catch (error) {
    console.log(error);
}
