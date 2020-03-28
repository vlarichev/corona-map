
//import "./serviceWorker";
import "./css/style.css";
import "./css/map.css";
import  './node_modules/bulma-pageloader/dist/css/bulma-pageloader.min.css';

import L from "leaflet";
import "./components/leaflet-heat";
import mainChart from "./components/chartMainAll"

import ClipboardJS from 'clipboard';
import KMZParser from  'leaflet-kmz';

//import getRssFeed from "./components/rssFeed"
//import {simpleCache} from "./components/simpleCache";

import plotAlter from "./components/chartCountyAgeDeaths";
import plotGeschlecht from "./components/chartSexAgeDeaths";



const CORS_PROXY = process.env.CORS_PROXY;
//const CORS_PROXY = "https://rocky-lowlands-03275.herokuapp.com/";
const _mbK = process.env.MAPBOX_KEY;
//const _mbK = "pk.eyJ1IjoieWFuZGV4IiwiYSI6ImNrN3VjcXAwZjA4ZWwzZG8zMXMxbno2OHoifQ.Olqh_fAunLLOb_e478wpXQ";

const urlRK = "https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html";
const bundesGeojson = "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/master/2_bundeslaender/4_niedrig.geojson";
const esriDashboard = 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(Recovered%3C%3E0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Recovered%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&resultOffset=0&resultRecordCount=250&cacheHint=true';

const wikiPageAdress = "COVID-19-Pandemie_in_Deutschland";

const maxRadius = 50000;

const gemeldeteCity = false;


var bundesAreas = require("./germany-borders.json");
//var germany = require("./germany.json");


new ClipboardJS('.btn');

var geojson;

const MapCenter = [51.358261, 10.373875];
const normZoom = 6;

var mymap = L.map("mapid", { 
    zoomControl: false,
    maxZoom: 9,
    minZoom:3,
    //scrollWheelZoom: false,
    //doubleClickZoom: false,
}).setView(MapCenter, normZoom);



//Zähle bis alles geladen ist oder mindestens X sekunden vergangen sind
const loader = document.getElementById("loader");
var loadedCount = 0;
var minWait = 3000;
const loadedElements = 2; 

function loadingDone(){
  loadedCount ++;
  loader.classList.remove('is-active');
  //if(loadedCount === loadedElements)
  loader.classList.remove('is-active');
}

setTimeout(loadingDone, minWait)


L.tileLayer( "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, Quellen : <a href="https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html">Rober Koch Institut</a> und <a href="https://commons.wikimedia.org/wiki/File:COVID-19_Outbreak_Cases_in_Germany_Kreise.svg" title="via Wikimedia Commons">Smurrayinchester</a> / <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA</a>, <a href="services1.arcgis.com">ESRI</a>',
    id: "mapbox/light-v9",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: _mbK,
    mapId: "mapbox/light-v9",
}).addTo(mymap);

/*
Alternativ Openstreetmap, sieht aber 💩 aus
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);
*/


//var germanLayer = L.geoJSON(germany).addTo(mymap);


var parser = new DOMParser();

function updateDate(){
  var x = new Date();
  document.getElementById('stand').innerHTML = "&nbsp; Stand: " +x.getDate()+"."+(x.getMonth()+1) +" "+ x.getHours() + ":00 Uhr";
}

function getLastDataFromRK(){
  return fetch(CORS_PROXY+urlRK)
    .then(response => response.text())
    .then(function(response) {       
        var html = parser.parseFromString(response, "text/html");
        var table = html.querySelectorAll("table")[0];
        var parsedTabe = tableToJson(table);
        allData = parsedTabe;
        console.log(allData);
        table2land(parsedTabe)
    });
}

function printDevConsoleMessage(){
  console.log('%c Hi! 🙋‍♂️ ', 'background: #222; color: #bada55;font-size:22px;');
  console.log('%c Liebe Entwickler, lass uns gemeinsam eine gute API dafür aufbauen! ', 'background: #222; color: #bada55;font-size:22px;');
  console.log('%c Es wäre super z.B. ein historischen Verlauf je Bundesland dafür zu haben ', 'background: #222; color: #bada55;font-size:22px;');
  console.log('%c Einfach eine Email an vladlarichev@gmail.com ', 'background: #222; color: #bada55;font-size:22px;');
}



var globalStore = {deaths:0, recovered:0 }
var store = {};
var allVaules = [];
var all = 0;

var x = `
"": "Thüringen"
​"an­zahl": "74"
​"dif­fe­renzzumvor­tag": "+23"
​"erkr./100.000einw.": "3,5"
​"todes­fälle": "0"
​undefined: ""
`
function table2land(table){
    table.forEach(function(a){
        
        // UPD RKI institut hat wieder die Tabelle verändert: jetzt-> key: "688 (3)"
        var val = a[Object.keys(a)[0]].split(" ");
        var krank = parseInt(a['an­zahl'].replace(".",""));
        var neu = parseInt(a['dif­fe­renzzumvor­tag'] ? a['dif­fe­renzzumvor­tag'].replace("+",""): 0);
        var tod = parseInt(a['todes­fälle'] ? a['todes­fälle'].replace("(","").replace(")",""): 0);
        //var krank = a[Object.keys(a)[1]];
        //var tod = a[Object.keys(a)[0]];
        //console.log(a); 
        if(!isNaN(krank)){
          store[val] = {
            "krank" : krank,
            "neu": neu,
            "tod"   : tod
          };
          allVaules.push(krank);
         
        }
    });
    //store.gesamt = all;
    //console.log(store)
    setTimeout(printPoints(store),0);
    setTimeout(createAreas(store),0);
  }
  

var cityContainer =[]; 

function getCurrentESRI(){
  function printCity(city){
    var coord = [city.Lat, city.Long_];
    cityContainer.push(L.circle(coord, {
      color: "black",
      fillColor: "#f03",
      fillOpacity: 0.1,
      radius: returnSize(city.Confirmed)
    }).bindTooltip(`${city.Country_Region}:<br>` + returnPeople(city.Confirmed) + `<br> ${city.Recovered} geheilt<br> ${city.Deaths} Verstorben`, {
      permanent: true,  
      direction: 'top',
      opacity: city.Confirmed > 0 ? 1: 0
    }))
  }
  function printData(data){
    globalStore.recovered = data.Recovered;
    globalStore.deaths = data.Deaths;
    globalStore.gesamt = data.Confirmed;
    //console.log(data);
    info.update();
  }


  fetch("https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(Recovered%3C%3E0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Recovered%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&resultOffset=0&resultRecordCount=250&cacheHint=true")
    .then(a =>  a.json())
    .then((b) => {
     //console.log(b)
     b.features.forEach(city => printCity(city.attributes));
     
     return b.features.filter(b => b.attributes.Country_Region == "Germany")[0].attributes;
    })
    .then(b => printData(b))
    .then(function(){
      var cities = L.layerGroup(cityContainer);
      control.addBaseLayer(cities, "Weltweit");
    } )
  loadingDone();
  }
  

var allData;


const pointsLibrary = {
    1 :   {coord: [48.537778,9.041111], name:"Baden-Württemberg" },  //BW
    2 :   {coord: [48.946389,11.404167],name:"Bayern" },  //BY
    3 :   {coord: [52.502889,13.404194],name:"Berlin" },  //BE
    4 :   {coord: [52.459028,13.015833],name:"Brandenburg" },  //BB
    5 :   {coord: [53.108821, 8.805630],name:"Bremen" },  //BR
    6 :   {coord: [53.568889,10.028889],name:"Hamburg" },  //HA
    7 :   {coord: [50.608047,9.028465], name:"Hessen" },   //HE
    8 :   {coord: [53.7735,12.575558],  name:"Mecklenburg-Vorpommern" },    //MV
    9 :   {coord: [52.839842,9.076019], name:"Niedersachsen" },   //NS
    10 :  {coord: [51.478333,7.555],    name:"Nordrhein-West­falen" },     //NW
    11 :  {coord: [49.955139,7.310417], name:"Rheinland-Pfalz" },  //RP
    12 :  {coord: [49.384167,6.953611], name:"Saarland" },  //SL
    13 :  {coord: [50.929472,13.458333],name:"Sachsen" }, //SAc
    14 :  {coord: [52.009056,11.702667],name:"Sachsen-Anhalt" }, //SAn
    15 :  {coord: [54.185556,9.822222], name:"Schleswig-Holstein" },  //SH
    16 :  {coord: [50.903333,11.026389],name:"Thüringen" }   //Th
} 

var Bundesländer = [];
var kommunenGroup;

function printPoints(lib){
  console.log(lib)
  var blArray = Object.keys(lib);
  for (var bl in pointsLibrary) { 
    var coordinates = pointsLibrary[bl].coord;
    var name = pointsLibrary[bl].name;
    var people = lib[blArray[bl-1]];
    //console.log(people)
    if(people)createCircles(coordinates, people, name);
  }
}


function createAreas(){
    geojson = L.geoJSON(bundesAreas, { 
      style: style, 
      onEachFeature: onEachFeature
    });
    
    Bundesländer.push(geojson);
    kommunenGroup = L.layerGroup(Bundesländer);
    kommunenGroup.addTo(mymap);
    control.addBaseLayer(kommunenGroup, "Bundesländer");
} 


function returnSize(people){
    var max = Math.max(...allVaules);
    var resultRadius = maxRadius/max * people;
    return Math.floor(resultRadius);
}

function returnPeople(people){
  if (people == 1) return people + " Fall";
  else return people + " Fälle"; 
}

function niceNum(intNum){
  if(intNum) return intNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return 0;
}

function createCircles(coord, people, name) {
  var krank = niceNum(people.krank)
  var todSpan = "";
  var newSpan = "";
  //if(people.neu>0) newSpan = `<i><span class="has-text-grey has-text-weight-light"> (+${people.neu})</span>`;
  if(people.tod>0) todSpan = `<div class="has-text-centered has-text-grey has-text-weight-light">${people.tod} Todesfälle</div>`;
    Bundesländer.push(L.circle(coord, {
      color: "black",
      fillColor: "white",
      //fillColor: "#f03",
      fillOpacity: 0.2,
      radius: returnSize(krank),
      weight: 1
    })
    .bindTooltip(`<div class="has-text-centered has-text-weight-bold"> <i class="fas fa-user"></i> ${krank}</div>`+ newSpan + todSpan , {
      permanent: true,
      direction: 'top',
      //opacity: krank > 0 ? 0.8: 0
    })
    );
}

document.getElementById('modal-button').addEventListener('click', function(event) {
    event.preventDefault();
    var modal = document.querySelector('#infoBox');  // assuming you have only 1
    var html = document.querySelector('html');
    modal.classList.add('is-active');
    html.classList.add('is-clipped');
  
    modal.querySelector('.modal-background').addEventListener('click', function(e) {
      e.preventDefault();
      modal.classList.remove('is-active');
      html.classList.remove('is-clipped');
    });
  });



var legend = L.control({position: 'bottomright'});



function initColormap(){


    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
        //grades = allVaules.sort(sortNumber).filter(function(el,i,a){return i===a.indexOf(el)}),
        grades = [0, 50, 100, 200, 300, 500],
        labels = [];
        // loop through our density intervals and generate a label with a colored square for each interval
        var cur, next;
        for (var i = 0; i < grades.length; i++) {
          cur = grades[i];
          next = grades[i + 1];
          div.innerHTML +=
            '<i style="background:' + getColor(cur + 1, Math.max(...allVaules)) + '"></i> ' + cur + (next ? '&ndash;' + next + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(mymap);
  }


function getRandomInt(max) { return Math.floor(Math.random() * Math.floor(max)); }


function sortNumber(a, b) {
    return a - b;
  }

function getColorRed(d, max) {
    return  d > max/1 ? "#800026" : 
            d > max/2 ? "#BD0026" : 
            d > max/5 ? "#E31A1C" : 
            d > max/10 ? "#FC4E2A" : 
            d > max/20 ? "#FD8D3C" : 
            d > max/50  ? "#FEB24C" : 
            d > max/100 ? "#FED976" : "#FFEDA0";
}

function getColor(d, max) {
    //console.log(d,max)
    return  d > max/1 ? "#FD8D3C" : 
            d > max/2 ? "#FD8D3C" : 
            d > max/5 ? "#FEB24C" : 
            d > max/10 ? "#FFBF69" : 
            d > max/20 ? "#FED976" : 
            d > max/50  ? "#FED976" : 
            d > max/100 ? "#FED976" : "#FFEDA0";
}
  

  function style(feature) {
    var name = feature.properties.NAME_1;
    //console.log(store[name]);
    var people = store[name] ? store[name]["krank"] : 0;
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

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: highlightFeature
    });
  }



function tableToJson(table) {
    var data = [];
    //console.log(table)
    // first row needs to be headers
    var headers = [];
    for (var i = 0; i < table.rows[0].cells.length+2; i++) {
      //headers[i] = i
      
      headers[i] = table.rows[1].cells[i].innerHTML
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



 


  






var control = L.control.layers(null, null, { collapsed: false }).addTo(mymap);


var info = L.control();

var initLegend = function(){
   
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {

        this._div.innerHTML = 
          '<div class="has-text-danger has-text-weight-bold is-capitalized is-size-6">GESAMT:</div>' 
        + '<div class="desktopFeature" style="font-size:smaller;">Quelle WHO, weicht ggf. von RKI ab </div>'
        + '<div style="font-weight: 700;"><br class="desktopFeature">'
          + '<h3 class="has-text-weight-bold">'+ niceNum(globalStore.gesamt) +'</h3><br class="desktopFeature">'
          //+ '<div style="color: green;">Genesen - '+ globalStore.recovered  +' ('+ Math.round(globalStore.recovered/globalStore.gesamt*1000)/10 +'%)'+'</div>'
        + '</div>'
        + '<div style="margin-top: -6px;" class="has-text-centered">Gestorben - '+ globalStore.deaths +'</div>'
        + '<section class="desktopFeature"><br>'
        + '<div>Robert Koch Institut:</div>'
        +  (props ? '<b>' + props.NAME_1 + '</b><br />' + (store[props.NAME_1] ? store[props.NAME_1]["krank"] :0) + ' Kranke gemeldet' : 'Bundesland auswählen')
        + '</section>'
    };
    
    info.addTo(mymap); 
}

var arrayOfCity = [];
var heat;

//add Googkle Map With cities
var kmzParser = new L.KMZParser({
  onKMZLoaded: function(layer, name) {

    var gLayer = layer;
    gLayer.options.attribution = "<a href='https://www.google.com/maps/d/u/0/viewer?mid=1QvEWEo7pNQKxts6N-IT78g9NC6kOdFna&hl=en_US&ll=50.20862880313433%2C10.379803594108807&z=8&fbclid=IwAR0qySc2ukUJwog3FSfHwxVG2RUqUkvXsre5FsmCrP3f_KHBRArc_nX2mII'>Google myMaps</a>";
    
    control.addBaseLayer(gLayer, "Städte");
    
    //console.log(gLayer);
    
    for (var layerIndex in gLayer._layers ){
      if(gLayer._layers[layerIndex].geojson){
        gLayer._layers[layerIndex].geojson.features.forEach(point => {
          var point = point.geometry.coordinates;
          //point[2] = 0.5;
          var x = point[0];
          var y = point[1];
          var i = 0.5;
          var pp = [y,x,i]
          arrayOfCity.push(pp)
        })
      }
    }
    //console.log(arrayOfCity)
    heat = L.heatLayer(arrayOfCity, {
      radius: 14,
      minOpacity:0.8,
      blur:15,
      //gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
      gradient: {0.4: '#fdf1bb', 0.65: 'orange', 1: '#ef5d02'}
      //gradient: {0.4: 'antiquewhite', 0.65: 'beige', 1: 'white'}
    });
    //control.addOverlay(heat, 'Areale')
    heat.addTo(mymap);
    //console.log(heat)
    
    
    
  }
});

kmzParser.load(CORS_PROXY + 'https://www.google.com/maps/d/u/0/kml?mid=1QvEWEo7pNQKxts6N-IT78g9NC6kOdFna&lid=6WQl1QwoPOI');


const infoBoard = document.getElementById("info-pane");
const infoArray = document.getElementsByClassName("info");

var show = (el) =>  el.style.display = "block";
var hide = (el) => el.style.display = "none";

function showKommune(){
  zoomTo(normZoom);
  mymap.addLayer(heat);
  show(infoBoard);
  for (var legend in infoArray){
    if(typeof(infoArray[legend])== 'object') show(infoArray[legend]);
  }
}

function hideKommune(){
  hide(infoBoard);
  for (var legend in infoArray){
    if(typeof(infoArray[legend])== 'object') hide(infoArray[legend]);
  }
}

function zoomTo(zoom){
  mymap.flyTo(MapCenter,zoom);
}

function showWeltweit(){
  mymap.removeLayer(heat)
  hideKommune();
  zoomTo(4);
}
function showCity(){
  hideKommune();
  zoomTo(normZoom+1)
}

mymap.on('baselayerchange', function(layer){
  if (layer.name === "Bundesländer") showKommune();
  else if(layer.name === "Weltweit") showWeltweit();
  else if(layer.name === "Städte") showCity();
})

function _start(func){
  setTimeout(func,0)
}


/// MAIN START ///
document.addEventListener("DOMContentLoaded", function(event) {
  
  document.getElementById("bar").innerText = `
  <!-- Anfang  Widget Karte Deutschland-->\n
    <iframe  loading="lazy" src="https://corona.vladlarichev.com" 
    style="border:0px #ffffff none;" 
    name="myiFrame" 
    scrolling="no" 
    frameborder="1" 
    marginheight="0px" marginwidth="0px" height="400px" width="600px" 
    allowfullscreen></iframe>
  <!-- Ende Widget Karte -->
  `;

  document.getElementById('scrollToButton').addEventListener('click', function(){
    window.scrollBy(0, window.innerHeight);
  })

  updateDate()
  printDevConsoleMessage()
  //_start(getLastDataFromWiki); 
  _start(mainChart.createChart('info-pane')); 
  _start(getLastDataFromRK);  
  _start(initLegend);  
  //setTimeout(initColormap,0);  
  _start(getCurrentESRI);
  _start(plotAlter('canvasSterblichkeit'));
  _start(plotGeschlecht('canvasGeschlecht'));
});