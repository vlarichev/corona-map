import L from "leaflet";

var bundesAreas = require("./germany-borders.json");

var geojson;


var mymap = L.map("mapid", { 
    zoomControl: false,
    scrollWheelZoom: false
}).setView([51.358261, 10.373875], 6);

const _mbK = "pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNpdXh4cjM4YzAwMmsyb3IzMDA0aHV4a3YifQ.TiC4sHEfBVhLetC268aGEQ";
const url = "https://de.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=" + "COVID-19-F%C3%A4lle_in_Deutschland";


const bundesGeojson = "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/master/2_bundeslaender/4_niedrig.geojson";

L.tileLayer( "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, Quellen : <a href="https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html">Rober Koch Institut</a> und <a href="https://de.wikipedia.org/wiki/COVID-19-F%C3%A4lle_in_Deutschland">Wikipedia</a>',
    maxZoom: 18,
    id: "mapbox/light-v9",
    //id: "vladsalat/cjhc1vnul0nkw2rmvd9q91keg",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: _mbK,
    mapId: "mapbox/light-v9",
}).addTo(mymap);


function getLastData(){
    //fetch WIKI to get Table
    return fetch(url)
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        var html_code = response["parse"]["text"]["*"];
        var parser = new DOMParser();
        var html = parser.parseFromString(html_code, "text/html");
        var tables = html.querySelectorAll(".wikitable");
        var parsedTabe = tableToJson(tables[0]);
        allData = parsedTabe;
        //console.log(parsedTabe)
        table2land(parsedTabe)
    });
}

getLastData();

var store = {
  deaths:0,
  recovered:0

};

var daysAgo = 1;

var el = document.createElement( 'html' );

var SizeOfObject = (table) => Object.keys(table[0]).length-1;

var parseNumers = function(num){
    if (parseInt(num)) return parseInt(num);
    else return 0;
}

var allVaules = [];

function init(){
    
}

var arrayOfDates;

function table2land(table){
    var todayIndex = SizeOfObject(table);
    
    console.log(table)
    arrayOfDates = Object.keys(table[0]);
    
    var lastDate = arrayOfDates[arrayOfDates.length-1 - daysAgo];
    //console.log(lastDate);
    printDate(lastDate)

    for (var entry in table){
        
        var zeile = table[entry]
        
        var varLastDate = zeile[Object.keys(zeile)[Object.keys(zeile).length - 1 - daysAgo]]
        
        
        var x = zeile["bundesland\n"]
        el.innerHTML = x;

        var blID = el.getElementsByTagName( 'a' ).length >0 ? el.getElementsByTagName( 'a' )[0].getAttribute("title"): el.getElementsByTagName('body')[0].innerText;
        var resNumber = parseNumers(varLastDate);
        console.log(varLastDate)
        allVaules.push(resNumber);
        store[blID] = resNumber;
    }
    console.log(store);
    printPoints(store);
    createAreas(store);
    getCurrentESRI();
    initLegend();
}

const esriDashboard = 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(Recovered%3C%3E0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Recovered%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&resultOffset=0&resultRecordCount=250&cacheHint=true';

function getCurrentESRI(){
  function printData(data){
    store.recovered = data.Recovered;
    store.deaths = data.Deaths;
    info.update();
  }
  fetch(esriDashboard)
    .then(a => a.json())
    .then(a => a.features.filter(a => a.attributes.OBJECTID == 126)[0].attributes)
    .then(b => printData(b));
}

var allData;


const pointsLibrary = {
    1 : {coord: [48.537778,9.041111], name:"Baden-Württemberg" },  //BW
    2 : {coord: [48.946389,11.404167], name:"Bayern" },  //BY
    3 : {coord: [52.502889,13.404194], name:"Berlin" },  //BE
    4 : {coord: [52.459028,13.015833], name:"Brandenburg" },  //BB
    5 : {coord: [53.108821, 8.805630], name:"Bremen" },  //BR
    6 : {coord: [53.568889,10.028889], name:"Hamburg" },  //HA
    7 : {coord: [50.608047,9.028465], name:"Hessen" },   //HE
    8 : {coord: [53.7735,12.575558], name:"Mecklenburg-Vorpommern" },    //MV
    9 : {coord: [52.839842,9.076019], name:"Niedersachsen" },   //NS
    10 : {coord: [51.478333,7.555], name:"Nordrhein-Westfalen" },     //NW
    11 : {coord: [49.955139,7.310417], name:"Rheinland-Pfalz" },  //RP
    12 : {coord: [49.384167,6.953611], name:"Saarland" },  //SL
    13 : {coord: [50.929472,13.458333], name:"Sachsen" }, //SAc
    14 : {coord: [52.009056,11.702667], name:"Sachsen-Anhalt" }, //SAn
    15 : {coord: [54.185556,9.822222], name:"Schleswig-Holstein" },  //SH
    16 : {coord: [50.903333,11.026389], name:"Thüringen" }   //Th
} 


function printPoints(lib){
    console.log(lib);
    for (var bl in pointsLibrary) { 
        var coordinates = pointsLibrary[bl].coord;
        var name = pointsLibrary[bl].name;
        var people = lib[name];
        createCircles(coordinates, people, name);
    }
}


function printDate(date){
    var dateArray = date.split('.');
    var formatedDate = ' &nbsp; Stand <b>' + dateArray[0] + "." + dateArray[1] +  "</b>";
    document.getElementById('stand').innerHTML = formatedDate;
}

function createAreas(store){
    //console.log(bundesAreas,store)
    geojson = L.geoJSON(bundesAreas, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(mymap);
} 

const maxRadius = 50000;

function returnSize(people){
    //var min = Math.min(...allVaules);
    var max = Math.max(...allVaules);

    var resultRadius = maxRadius/max * people;
    //console.log(resultRadius);
    return Math.floor(resultRadius);
}


function createCircles(coord, people, name) {
  var circle = L.circle(coord, {
    color: "black",
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: returnSize(people)
  }).bindTooltip(`${people} Fälle in ${name}`, {
      permanent: true,  
      direction: 'top',
      opacity: people > 0 ? 1: 0
  }).addTo(mymap);

  
}


document.getElementById('modal-button').addEventListener('click', function(event) {
    event.preventDefault();
    var modal = document.querySelector('.modal');  // assuming you have only 1
    var html = document.querySelector('html');
    modal.classList.add('is-active');
    html.classList.add('is-clipped');
  
    modal.querySelector('.modal-background').addEventListener('click', function(e) {
      e.preventDefault();
      modal.classList.remove('is-active');
      html.classList.remove('is-clipped');
    });
  });


var info = L.control();

var initLegend = function(){
   

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>Erkrankte gesamt</h4>' 
        + '<div style="font-weight: 700;">'
        + '<div style="color: green;">Geheilt - '+ store.recovered  +' ('+ Math.round(store.recovered/store.gesamt*1000)/10 +'%)'+'</div>'
        + '<div>Gestorben - '+ store.deaths +'</div><br><hr>'
        + '</div>'
        + '<h3>'+ store["gesamt"] +'</h3><br>'
        +  (props ? '<b>' + props.NAME_1 + '</b><br />' + store[props.NAME_1] + ' Menschen' : 'Bundesland auswählen');
    };
    
    info.addTo(mymap); 


    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            //grades = allVaules.sort(sortNumber).filter(function(el,i,a){return i===a.indexOf(el)}),
            grades = [0, 10, 20, 50, 100, 200, 500, 1000],
            labels = [];
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1, ...allVaules) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

legend.addTo(mymap);
}





/* ##### lib ###### */
/* ##### lib ###### */
/* ##### lib ###### */
/* ##### lib ###### */
/* ##### lib ###### */
/* ##### lib ###### */
/* ##### lib ###### */
/* ##### lib ###### */
/* ##### lib ###### */

function getRandomInt(max) { return Math.floor(Math.random() * Math.floor(max)); }


function sortNumber(a, b) {
    return a - b;
  }

function getColor(d, max) {
    return  d > max/1 ? "#800026" : 
            d > max/2 ? "#BD0026" : 
            d > max/5 ? "#E31A1C" : 
            d > max/10 ? "#FC4E2A" : 
            d > max/20 ? "#FD8D3C" : 
            d > max/50  ? "#FEB24C" : 
            d > max/100 ? "#FED976" : "#FFEDA0";
}
  

  function style(feature) {
      var name = feature.properties.NAME_1;
      var people = store[name];
    return {
      fillColor: getColor(people, Math.max(...allVaules)),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7
    };
  }
  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }
  
  function highlightFeature(e) {
    var layer = e.target;
    //console.log(layer.feature.properties)
    info.update(layer.feature.properties);
    layer.setStyle({
      weight: 2,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.7
    });
  
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }


  
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: highlightFeature
    });
  }



function tableToJson(table) {
    var data = [];
  
    // first row needs to be headers
    var headers = [];
    for (var i = 0; i < table.rows[0].cells.length; i++) {
      headers[i] = table.rows[0].cells[i].innerHTML
        .toLowerCase()
        .replace(/ /gi, "");
    }
  
    // go through cells
    for (var i = 1; i < table.rows.length; i++) {
      var tableRow = table.rows[i];
      var rowData = {};
  
      for (var j = 0; j < tableRow.cells.length; j++) {
        rowData[headers[j]] = tableRow.cells[j].innerHTML;
      }
  
      data.push(rowData);
    }
  
    return data;
  }


  