"use strict";

var url = "http://api.arbetsformedlingen.se/af/v0";
var perCounty = url + "/platsannonser/soklista/lan";
var prognoses = "http://api.arbetsformedlingen.se:80/af/v2/forecasts/occupationalArea/shortTerm/";
var ITnumber = "3";

var selectListAtTopElement = document.getElementById('searchlan');
var searchTextElement = document.getElementById('searchText');
var searchButtonElement = document.getElementById('searchbutton');
searchButtonElement.addEventListener('click', getSelectedId, false);

var logoElement = document.getElementById('logo');
logoElement.addEventListener('click', clearWithLogo, false);

var onlyITelement = document.getElementById('onlyit');
onlyITelement.addEventListener('change', requestCounties, false);

var numberRowsElement = document.getElementById('numrows');
numberRowsElement.addEventListener('change', requestCounties, false);


function clearWithLogo() {

    var clearWithLogoElement = document.getElementById('info');
    clearWithLogoElement.innerHTML = "";
}


function clearStartpage(responseInJson) {

    var clearElement = document.getElementById('info');
    clearElement.innerHTML = "";

    printAds(responseInJson);
}


//Hämtar filen med alla län och antal lediga jobb per län
function requestCounties() {
    
    var request = new XMLHttpRequest();

    request.onload = function () {
        if (request.status === 200) {
            var infoInJSONfile = JSON.parse(request.responseText);
            printCounties(infoInJSONfile);
        }
    }
    request.open('GET', perCounty, true);
    request.send(null);
}
requestCounties();


//Skriver ut länen och matchar dom med rätt id
//Ger rätt innehåll till select-listan med län
function printCounties(json) { 

    var everyCountyElement = document.getElementById('mainnavlist');
    everyCountyElement.innerHTML = "";
    selectListAtTopElement.innerHTML = "";
    var county = json.soklista.sokdata;

    //Länken för hela Sverige har en extra bokstav utöver de för länen
    selectList("Hela Sverige", "did=199");
  
    for (var i = 0; i < county.length; i++) {

        var linkCountyElement = document.createElement('a');        
       
        //Förändrar utseendet på listan med län
        document.querySelector('ul').setAttribute('style', 'list-style-type:none');

        var nameCountyTextNode = document.createTextNode(county[i].namn +
            " (" + county[i].antal_ledigajobb + ")");
        linkCountyElement.appendChild(nameCountyTextNode);
 
        var listCountyElement = document.createElement('li');
        listCountyElement.appendChild(linkCountyElement);
 
        //Länken för hela Sverige skiljer med en bokstav, därav måste viss text följa med 
        var countyID = "id=" + county[i].id;

        everyCountyElement.appendChild(listCountyElement);
        selectList(county[i].namn, countyID);
         
        if (onlyITelement.checked) {
            linkCountyElement.addEventListener('click', requestOnlyIT.bind(this, county[i].id), false);
        } else {
            linkCountyElement.addEventListener('click', requestAds.bind(this, countyID), false);
        }
    }
}


//Hämtar fil endast IT
function requestOnlyIT(id) {
    
    var request = new XMLHttpRequest();

    var linkOnlyIT
        = url + "/platsannonser/matchning?lanid=" + id + "&yrkesomradeid=" + ITnumber + "&antalrader=" + numberRowsElement.value;

        request.onload = function () {

        if (request.status === 200) {
            var responseInJson = JSON.parse(request.responseText);
            requestPrognose(responseInJson);
        }
    }
    request.open('GET', linkOnlyIT, true);
    request.send(null);
}


//Hämtar JSON-fil med annonser för valt län
//Anropar funktion som rensar startsidan
function requestAds(countyID) {

    var request = new XMLHttpRequest();

    var linkAds
        = url + "/platsannonser/matchning?lan" + countyID + "&antalrader=" + numberRowsElement.value;

    request.onload = function () {

        if (request.status === 200) {
            var responseInJson = JSON.parse(request.responseText);
            clearStartpage(responseInJson);
        }
    }
    request.open('GET', linkAds, true);
    request.send(null);
}


//Hämtar fil baserad på sökord
function requestWithKeyword(countyID) {

    var request = new XMLHttpRequest();

    var linkWithKeyword
    = url + "/platsannonser/matchning?lan" + countyID + "&nyckelord=" + searchTextElement.value + "&antalrader=" + numberRowsElement.value;

    request.onload = function () {

        if (request.status === 200) {
            var responseInJson = JSON.parse(request.responseText);
            clearStartpage(responseInJson);
        }
    }
    request.open('GET', linkWithKeyword, true);
    request.send(null);
}


//Skickar vidare vad som har valts i selectboxen
function getSelectedId() {
    requestWithKeyword(selectListAtTopElement.options[selectListAtTopElement.selectedIndex].value);
    searchTextElement.value = "";
}


//Selectlistan
function selectList(name, id) {
    
    var optionElement = document.createElement('option');
    optionElement.setAttribute('value', id);

    var optionTextNode = document.createTextNode(name);
    optionElement.appendChild(optionTextNode);
    selectListAtTopElement.appendChild(optionElement);
}


//Skriver ut valda delar av platsannonserna
function printAds(json) {

    var everyHiringElement = document.getElementById('info');
    var hiring = json.matchningslista.matchningdata;

    if (hiring == undefined) {
    
        var noWorkElement = document.createElement('h3');
        var noWorkTextNode = document.createTextNode("Det finns tyvärr inga lediga arbeten som matchar din sökning.");
        noWorkElement.appendChild(noWorkTextNode);

        var breakElement = document.createElement('br');
        noWorkElement.appendChild(breakElement);

        var noWorkElement2 = document.createElement('h4');
        var noWorkTextNode2 = document.createTextNode("Kanske dags att utbilda dig till något annat?");
        noWorkElement2.appendChild(noWorkTextNode2);
        noWorkElement.appendChild(noWorkElement2);

        everyHiringElement.appendChild(noWorkElement);
        
    } else {


        for (var i = 0; i < hiring.length; i++) {

            var hiringElement = document.createElement('article');

            var captionTitleElement = document.createElement('h3');
            var captionTitleTextNode = document.createTextNode(hiring[i].annonsrubrik);
            captionTitleElement.appendChild(captionTitleTextNode);
            hiringElement.appendChild(captionTitleElement);


            var serviceEmployerTownElement = document.createElement('h4');
            var serviceTextNode = document.createTextNode(hiring[i].yrkesbenamning);
            serviceEmployerTownElement.appendChild(serviceTextNode);

            var hosText = document.createTextNode(" hos ");
            serviceEmployerTownElement.appendChild(hosText);

            var employerTextNode = document.createTextNode(hiring[i].arbetsplatsnamn);
            serviceEmployerTownElement.appendChild(employerTextNode);

            var iText = document.createTextNode(" i ");
            serviceEmployerTownElement.appendChild(iText);

            var townTextNode = document.createTextNode(hiring[i].kommunnamn);
            serviceEmployerTownElement.appendChild(townTextNode);

            var punktText = document.createTextNode(".");
            serviceEmployerTownElement.appendChild(punktText);

            hiringElement.appendChild(serviceEmployerTownElement);


            var typeOfWorkElement = document.createElement('strong');
            var anstallningstyp = document.createTextNode("Anställningstyp: ");
            typeOfWorkElement.appendChild(anstallningstyp);
            hiringElement.appendChild(typeOfWorkElement);

            var typeOfWorkTextNode = document.createTextNode(hiring[i].anstallningstyp);
            hiringElement.appendChild(typeOfWorkTextNode);

            var breakElement = document.createElement('br');
            hiringElement.appendChild(breakElement);

            var availableSpotsElement = document.createElement('strong');
            var antalPlatser = document.createTextNode("Antal platser: ");
            availableSpotsElement.appendChild(antalPlatser);
            hiringElement.appendChild(availableSpotsElement);

            var availableSpotsTextNode = document.createTextNode(hiring[i].antalplatser);
            hiringElement.appendChild(availableSpotsTextNode);

            var breakElement = document.createElement('br');
            hiringElement.appendChild(breakElement);

            var publicationDateElement = document.createElement('strong');
            var publiceringsdatum = document.createTextNode("Publiceringsdatum: ");
            publicationDateElement.appendChild(publiceringsdatum);
            hiringElement.appendChild(publicationDateElement);

            //Datumet hämtas och kapas till rätt antal siffror
            var publicationDateTextNode = document.createTextNode(onlyDate(hiring[i].publiceraddatum));
            hiringElement.appendChild(publicationDateTextNode);

            var breakElement = document.createElement('br');
            hiringElement.appendChild(breakElement);

            var applicationDateElement = document.createElement('strong');
            var sistaAnsokan = document.createTextNode("Sista ansökningsdag: ");
            applicationDateElement.appendChild(sistaAnsokan);
            hiringElement.appendChild(applicationDateElement);

            var applicationDateTextNode = document.createTextNode(onlyDate(hiring[i].sista_ansokningsdag));
            hiringElement.appendChild(applicationDateTextNode);

            var breakElement = document.createElement('br');
            hiringElement.appendChild(breakElement);
            var breakElement = document.createElement('br');
            hiringElement.appendChild(breakElement);

            var linkButtonElement = document.createElement('a');
            linkButtonElement.setAttribute('class', 'btn');
            linkButtonElement.setAttribute('href', hiring[i].annonsurl);
            linkButtonElement.setAttribute('target', '_blank');
            var lasMer = document.createTextNode("Läs mer: ");
            linkButtonElement.appendChild(lasMer);
            hiringElement.appendChild(linkButtonElement);

            everyHiringElement.appendChild(hiringElement);
        }
    }
}


function onlyDate(getDate) {
    if (getDate === undefined) {
        //Gör så att det aldrig står "undefined" i consolen
       return getDate;
    } 
    return getDate.substr(0, 10);

}


//Så att den inte laddas om ifall man exv klickar på loggan
window.onload = requestAmount();

//Hämtar fil med antal lediga jobb per län
function requestAmount() {

    var request = new XMLHttpRequest();
    request.onload = function () {

        if (request.status === 200) {
            var infoInJSONfile = JSON.parse(request.responseText);
            onStartPage(infoInJSONfile);
        }
    }
    request.open('GET', perCounty, true);
    request.send(null);
}


function onStartPage(json) {
    
    var bw = json.soklista.sokdata;
   
    //Skickar vidare filerna till två arrayer och samlar in svaret från arrayerna 
    var best1 = best(bw);
    var worst1 = worst(bw);

    //Skickar vidare resultatet
    printBest(best1[0], best1[1]);
    printWorst(worst1[0], worst1[1]);
}

   
//Startar på 0 och loopar igenom JSON-filen
//Varje siffra som är högre än den föregående sparas tillsammans med tillhörande länsnamn i arrayen
function best(bw) {
    var most = [0,""];

    for (var i = 0; i < bw.length; i++) {
    
        if (bw[i].antal_ledigajobb >= most[0]) {
            most[0] = bw[i].antal_ledigajobb;
            most[1] = bw[i].namn;
        }
    }
    //returnerar det högsta värdet och namn
    return most; 
}


//Startar på högsta möjliga värde och loopar igenom JSON-filen
///Varje siffra som är lägre än den föregående sparas tillsammans med tillhörande länsnamn i arrayen
function worst(bw) {
    
    var least = [Number.MAX_SAFE_INTEGER,""];

    for (var i = 0; i < bw.length; i++) {
    
        if (bw[i].antal_ledigajobb <= least[0]) {
            least[0] = bw[i].antal_ledigajobb;
            least[1] = bw[i].namn;
        }

    }
    //returnerar det lägsta värdet och namn
    return least; 
}


function printBest(jobb, namn) {

    var bestWorst = document.getElementById('info');
    var bestWorstElement = document.createElement('article');

    var bestTextNode = document.createTextNode("Just nu finns det flest lediga jobb (");
    bestWorstElement.appendChild(bestTextNode);

    var mostAvailableJobsTextNode = document.createTextNode(jobb);
    bestWorstElement.appendChild(mostAvailableJobsTextNode);

    var bokstaveniTextNode = document.createTextNode(" st) i:");
    bestWorstElement.appendChild(bokstaveniTextNode);

    var nameBestElement = document.createElement('h2');
    var nameBestTextNode = document.createTextNode(namn);
    nameBestElement.appendChild(nameBestTextNode);
    bestWorstElement.appendChild(nameBestElement);

    var yay = document.createTextNode("Yayy!");
    bestWorstElement.appendChild(yay);

    var breakElement = document.createElement('br');
    bestWorstElement.appendChild(breakElement);
    var breakElement = document.createElement('br');
    bestWorstElement.appendChild(breakElement);
    var breakElement = document.createElement('br');
    bestWorstElement.appendChild(breakElement);
        
    bestWorst.appendChild(bestWorstElement);
}


function printWorst(jobb, namn) {

    var bestWorst = document.getElementById('info');
    var bestWorstElement = document.createElement('article');

    var bestTextNode = document.createTextNode("Just nu finns det minst lediga jobb (");
    bestWorstElement.appendChild(bestTextNode);

    var mostAvailableJobsTextNode = document.createTextNode(jobb);
    bestWorstElement.appendChild(mostAvailableJobsTextNode);

    var bokstaveniTextNode = document.createTextNode(" st) i:");
    bestWorstElement.appendChild(bokstaveniTextNode);

    var nameBestElement = document.createElement('h2');
    var nameBestTextNode = document.createTextNode(namn);
    nameBestElement.appendChild(nameBestTextNode);
    bestWorstElement.appendChild(nameBestElement);

    var yay = document.createTextNode("Buu!");
    bestWorstElement.appendChild(yay);

    var breakElement = document.createElement('br');
    bestWorstElement.appendChild(breakElement);
    var breakElement = document.createElement('br');
    bestWorstElement.appendChild(breakElement);
    var breakElement = document.createElement('br');
    bestWorstElement.appendChild(breakElement);
        
    bestWorst.appendChild(bestWorstElement);
}


//Hämtar fil med yrkesprognos
function requestPrognose(responseInJson) {

    var request = new XMLHttpRequest();
    var prognoseIT
     = prognoses + ITnumber;

    request.onload = function () {
        if (request.status === 200) {
            var infoInJSONfile = JSON.parse(request.responseText);
            getNumbers(infoInJSONfile, responseInJson);
        }
    }
    request.open('GET', prognoseIT, true);
    request.send(null);
}


function getNumbers(json, responseInJson) {

    var finalNumber = getAverage(json); 
    printCompetition(finalNumber, responseInJson);
}


function getAverage(json) {

    var number = 0;
    var amount = json.length;
    for (var i = 0; i < json.length; i++) {

        //Loopar igenom JSON-filen och adderar alla nummer
        if (json[i].assessmentNow > 0) {
            number = json[i].assessmentNow + number;
        }  
    }
    //Delar slutsumman med antalet inriktningar inom yrksområdet och levererar ett medelvärde
    var sum = number / amount;   
    //Avrundar medelvärdet för att det ska få en av siffrorna 1 till 5
    var finalNumber = Math.round(sum);

    return finalNumber;
}


function printCompetition(finalNumber, responseInJson) {

    //Ger rätt text till rutan
    if (finalNumber === 5) {
        finalNumber = "mycket liten konkurrens";

    } else if (finalNumber === 4) {
        finalNumber = "liten konkurrens";
    
    } else if (finalNumber === 3) {
        finalNumber = "lagom konkurrens";

    } else if (finalNumber === 2) {
        finalNumber = "hård konkurrens";

    } else if (finalNumber === 1) {
        finalNumber = "mycket hård konkurrens";

    } else {
        finalNumber = "oklar nivå på konkurrensen";
    }

    var easyDifficult = document.getElementById('info');
    easyDifficult.innerHTML = "";

    var rutaEDelement = document.createElement('div');
    rutaEDelement.id = "ruta";


    for (var i = 0; i <= 0; i++) {

        var konkurrensenInomTextNode = document.createTextNode("Just nu beräknas det vara ");
        rutaEDelement.appendChild(konkurrensenInomTextNode);

        var colorTextNode = document.createTextNode(finalNumber);
        rutaEDelement.appendChild(colorTextNode);

        var lastLineTextNode = document.createTextNode(" inom din valda yrkeskategori ");
        rutaEDelement.appendChild(lastLineTextNode);

        var strongElement = document.createElement('strong');
        var chosenTypeOfWorkTextNode = document.createTextNode("IT")
        strongElement.appendChild(chosenTypeOfWorkTextNode);
        rutaEDelement.appendChild(strongElement);

        var punktTextNode = document.createTextNode(".");
        rutaEDelement.appendChild(punktTextNode);

        easyDifficult.appendChild(rutaEDelement);
    }

    //Ger rätt färg till rutan
    document.querySelector('#ruta').setAttribute('style', 'margin:24px; padding:24px; \
    width:30%; margin-left:25%; display:block;'); 
 
    if (finalNumber === "mycket liten konkurrens") {
        document.getElementById("ruta").style.border = "thick solid #009900";
         
    } else if (finalNumber === "liten konkurrens") {
        document.getElementById("ruta").style.border = "thick solid #00FF00";
               
    } else if (finalNumber === "lagom konkurrens") {
        document.getElementById("ruta").style.border = "thick solid #B3FFFF";
              
    } else if (finalNumber === "hård konkurrens") {
        document.getElementById("ruta").style.border = "thick solid #FF9999";
              
    } else if (finalNumber === "mycket hård konkurrens") {
        document.getElementById("ruta").style.border = "thick solid #FF0000";
               
    } else { 
        document.getElementById("ruta").style.border = "thick solid #FFFF00";
    }
    printAds(responseInJson);
}





