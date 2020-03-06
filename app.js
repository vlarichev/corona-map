import L from "leaflet";
import rssParser from 'rss-parser-browser';
import ClipboardJS from 'clipboard';

import {MapChart} from "./components/chart"

var bundesAreas = require("./germany-borders.json");
var germany = require("./germany.json");

import '/node_modules/bulma-tooltip/dist/css/bulma-tooltip.min.css';

new ClipboardJS('.btn');

var geojson;

var mymap = L.map("mapid", { 
    zoomControl: false,
    scrollWheelZoom: false
}).setView([51.358261, 10.373875], 6);

const _mbK = "pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNpdXh4cjM4YzAwMmsyb3IzMDA0aHV4a3YifQ.TiC4sHEfBVhLetC268aGEQ";
const urlRK = "https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html";
const bundesGeojson = "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/master/2_bundeslaender/4_niedrig.geojson";
const esriDashboard = 'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=(Confirmed%20%3E%200)%20AND%20(Recovered%3C%3E0)&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Recovered%20desc%2CCountry_Region%20asc%2CProvince_State%20asc&resultOffset=0&resultRecordCount=250&cacheHint=true';
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"
const maxRadius = 50000;

L.tileLayer( "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, Quellen : <a href="https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html">Rober Koch Institut</a> und <a href="https://commons.wikimedia.org/wiki/File:COVID-19_Outbreak_Cases_in_Germany_Kreise.svg" title="via Wikimedia Commons">Smurrayinchester</a> / <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA</a>',
    maxZoom: 18,
    id: "mapbox/light-v9",
    //id: "vladsalat/cjhc1vnul0nkw2rmvd9q91keg",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: _mbK,
    mapId: "mapbox/light-v9",
}).addTo(mymap);

//var germanLayer = L.geoJSON(germany);

//console.log(germanLayer)

var imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/COVID-19_Outbreak_Cases_in_Germany_Kreise.svg/256px-COVID-19_Outbreak_Cases_in_Germany_Kreise.svg.png';
    var imageBounds = [[55.05652618408209, 5.87161922454834],[47.26985931396479,15.03811264038086]];
L.imageOverlay(imageUrl, imageBounds, {
  opacity: 0.4
}).addTo(mymap);

var parser = new DOMParser();

function getLastDataFromRK(){
  return fetch(CORS_PROXY+urlRK)
    .then(response => response.text())
    .then(function(response) {       
        var html = parser.parseFromString(response, "text/html");
        var table = html.querySelectorAll("table")[0];
        var parsedTabe = tableToJson(table);
        document.getElementById('stand').innerHTML = "&nbsp;" + table.previousElementSibling.innerText;
        allData = parsedTabe;
        table2land(parsedTabe)
    });
}

function printConsole(){
  console.log('%c Hi! 🙋‍♂️ ', 'background: #222; color: #bada55;font-size:22px;');
  console.log('%c Liebe Entwickler, lass uns gemeinsam eine gute API dafür aufbauen! ', 'background: #222; color: #bada55;font-size:22px;');
  console.log('%c Es wäre super z.B. ein historischen Verlauf je Bundesland dafür zu haben ', 'background: #222; color: #bada55;font-size:22px;');
  console.log('%c Einfach eine Email an vladlarichev@gmail.com ', 'background: #222; color: #bada55;font-size:22px;');
}

(function init(){
    getLastDataFromRK();
    setTimeout(printConsole,0)
    setTimeout(getRssFeed,0)
})();


const RSSFeed = 'https://www.rki.de/SiteGlobals/Functions/RSSFeed/RSSGenerator_nCoV.xml';

function getRssFeed(){
  rssParser.parseURL(CORS_PROXY+RSSFeed, function(err, parsed) {
    var feed = L.DomUtil.create('ul', 'feed');
    parsed.feed.entries.forEach(function(entry) {
      feed.innerHTML += `<li class="is-size-6"><b href="${entry.link}">${entry.title}</b><br><p>${entry.contentSnippet} <a href="${entry.link}">weiter lesen</a></p> </li>`;
    });
    document.getElementById('feed').appendChild(feed);
  });
}


var store = { deaths:0, recovered:0 };
var allVaules = [];
var all = 0;

function table2land(table){
    table.forEach(function(a){
        var num = parseInt(a.fälle)
        if(!isNaN(num)){
            store[a.bundesland] = num;
            all += num;
            allVaules.push(num);
        }
    });
    store.gesamt = all;
    console.log(store)
    setTimeout(printPoints(store),0);
    
    setTimeout(createAreas(store),0);
    setTimeout(initLegend(),0);  
    setTimeout(getCurrentESRI(),0);
  }
  
  

function getCurrentESRI(){
  function printData(data){
    store.recovered = data.Recovered;
    store.deaths = data.Deaths;
    info.update();
  }
  fetch(esriDashboard)
    .then(a => a.json())
    .then(a => a.features.filter(a => a.attributes.Country_Region == "Germany")[0].attributes)
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
    15 : {coord: [54.185556,9.822222], name:"Schleswig Holstein" },  //SH
    16 : {coord: [50.903333,11.026389], name:"Thüringen" }   //Th
} 


function printPoints(lib){
  for (var bl in pointsLibrary) { 
    var coordinates = pointsLibrary[bl].coord;
    var name = pointsLibrary[bl].name;
    var people = lib[name];
    if(people)createCircles(coordinates, people, name);
  }
}

function createAreas(){
    geojson = L.geoJSON(bundesAreas, { style: style, onEachFeature: onEachFeature})
        .addTo(mymap);
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

function createCircles(coord, people, name) {
  L.circle(coord, {
      color: "black",
      fillColor: "#f03",
      fillOpacity: 0.5,
      radius: returnSize(people)
    }).bindTooltip(returnPeople(people) + ` in ${name}`, {
      permanent: true,  
      direction: 'top',
      opacity: people > 0 ? 1: 0
    }).addTo(mymap);

  
}

document.getElementById('modal-button').addEventListener('click', function(event) {
    event.preventDefault();
    var modal = document.querySelector('#modal');  // assuming you have only 1
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
        + '<div style="color: green;">Genesen - '+ store.recovered  +' ('+ Math.round(store.recovered/store.gesamt*1000)/10 +'%)'+'</div>'
        + '</div>'
        + '<div>Gestorben - '+ store.deaths +'</div><br><hr>'
        + '<h3>'+ store["gesamt"] +'</h3><br>'
        +  (props ? '<b>' + props.NAME_1 + '</b><br />' + (store[props.NAME_1] ? store[props.NAME_1] :0) + ' Menschen' : 'Bundesland auswählen');
    };
    
    info.addTo(mymap); 


    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
        //grades = allVaules.sort(sortNumber).filter(function(el,i,a){return i===a.indexOf(el)}),
        grades = [1, 5, 10, 15,  20 , 40, 80, 100],
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
            d > max/10 ? "#FEB24C" : 
            d > max/20 ? "#FED976" : 
            d > max/50  ? "#FED976" : 
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



 


  /// Wiki

  const urlWiki = "https://de.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=" + "COVID-19-F%C3%A4lle_in_Deutschland";


 function getLastDataFromWiki(){
  //fetch WIKI to get Table
  return fetch(urlWiki)
  .then(function(response) {
    return response.json();
  })
  .then(function(response) {
      var html_code = response["parse"]["text"]["*"];
      //var parser = new DOMParser();
      var html = parser.parseFromString(html_code, "text/html");
      var tables = html.querySelectorAll(".wikitable tbody")[0];
      //console.log(tables)

      // struktur array[BundeslandID] = [werte....,null]
      var parsedTabe = parseWiki(tables);
      //console.log(parsedTabe)
      var chart = new MapChart(parsedTabe, pointsLibrary);
      chart.print();
      
  });
}



function parseWiki(table){
  var wikiTable = [];
  var c = table.rows;
  var blId = 1;
  for(var row in c){
    var skipSpalte = 0;
    if (!c[row].className && typeof(c[row]) == "object"){
      var spalten = c[row].children;
      //console.log(spalten)
      wikiTable[blId]=[];
      for (var index in spalten){
        if(skipSpalte > 0){
          wikiTable[blId].push(tryToParse(spalten[index].innerHTML))
        }
        skipSpalte++;
      }
      blId++;
    }
  } 
  return wikiTable;
}

var daysAgo = 1;
var arrayOfDates;

function tryToParse (num){
    if (parseInt(num)) return parseInt(num);
    else return null;
};


getLastDataFromWiki();
