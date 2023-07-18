//pageComps è un array di elementi HTML di cui scrivere informazioni; msgs è un array di messaggi da scrivere.
var showAlert = (pageComps, msgs) => {
    showCard(pageComps, msgs, 0);
};

var getId = id => document.getElementById(id);

var createButtons = (pageComps, msgs, i, stillMore, card, cardBody) => {
    if(stillMore) {
        var okButton = document.createElement("button");
        okButton.classList = "btn btn-primary";
        okButton.textContent = "Prosegui";
        okButton.onclick = function () {
            card.style.display = "none";
            window.location = "#" + pageComps[i + 1].getAttribute("id");
            showCard(pageComps, msgs, i + 1);
        };
        cardBody.appendChild(okButton);

        var cancelButton = document.createElement("button");
        cancelButton.classList = "btn btn-secondary";
        cancelButton.textContent = "Annulla";
        cardBody.appendChild(cancelButton);

        cancelButton.onclick = function () {
            card.style.display = "none";
        }
    } else {
        var endButton = document.createElement("button");
        endButton.classList = "btn btn-primary";
        endButton.textContent = "Termina";
        endButton.onclick = function () {
            card.style.display = "none";
        };
        cardBody.appendChild(endButton);
    }
}

var showCard = (pageComps, msgs, i) => {
    var card = document.createElement("div");
    card.classList = "card card-layouts";

    var cardBody = document.createElement("div");
    cardBody.className = "card-body";

    var cardText = document.createElement("p");
    cardText.className = "card-text";
    cardText.textContent = msgs[i];
    cardBody.appendChild(cardText);
    card.appendChild(cardBody);
    pageComps[i].appendChild(card);

    if (i < pageComps.length - 1) {
        createButtons(pageComps, msgs, i, true, card, cardBody);
    } else {
        createButtons(pageComps, msgs, i, false, card, cardBody);
    }
};
