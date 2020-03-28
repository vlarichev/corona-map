import Chart from "chart.js/dist/Chart.min";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Papa from 'papaparse';
var moment = require('moment');
import it from 'moment/locale/de';  
import { h, Component, render } from 'preact';
import './chartAll.css'

moment.locale('de');

const IGNOREKEYS        = ['Province/State','Country/Region','Lat','Long'];
const URL               = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'


const URL2              = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv';
const URL_DEATHS2        = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'
const URL_RECOVER2       = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv'
const URL_DEATHS        = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
const URL_RECOVER       = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv'
let myChart;
let ARRAYOFCOUNTRIES  = []
let MIN_NUMBER = 300;
let choise;

const colorArray = ["#555e7b","#f4da93","#b576ad","#e04644","#fde47f","#7ccce5","#b8c948","#92a9db","#f4da93","#ee823f","#67e0a1","#d60a69","#ce322f","#3ed6ab","#9fbee0","#e206d0"]; 
const SHOW_CONTRY_BY_DEFAULT = ['Germany','China','Italy','Korea, South','US']


const COUNTRYTOSTYLE = {
    'Germany': 'black',
    'Italy': 'green'
}

let status = 'infiziert';
let labels = [];  
let dataWithCountries = [];

let canvasDOM = 'myChart';

var setCanvas = (id) =>  canvasDOM = id;

function extractTimeseriesFromObject(countryLine){
    //console.log(countryLine);
    var res = [];
    for(var i in countryLine){
        if (IGNOREKEYS.indexOf(i) == -1){
            res.push(countryLine[i])
        }
    }
    return res;
}

function addTimeSeries(country1, country2){
    return country1.map(function (num, idx) {
        return num + country2[idx];
      }); 
}

function color(country){
    var randomColorIndex = Math.floor(Math.random() * colorArray.length-1) + 1 ;    
    return COUNTRYTOSTYLE[country]? COUNTRYTOSTYLE[country] : colorArray[randomColorIndex]
}

function returnLineset(country, data){
    //var country = c['Country/Region'];
    var testColor = color(country);
    return {
        label: country,
        backgroundColor: testColor,
        borderColor: testColor,
        borderWidth: 2,
        pointRadius: 0,
        hidden: SHOW_CONTRY_BY_DEFAULT.indexOf(country) == -1,
        data: data,
        fill: false,
    }
}

function updateData(res){
    dataWithCountries = [];
    for(var i in res){
        dataWithCountries.push(returnLineset(i, res[i]))
    };
    myChart.data.datasets = dataWithCountries;
    myChart.update();
}


var createDataLabels =  function(arr){
    var datesArray = [];
    for (var i in arr){
        if (IGNOREKEYS.indexOf(i) == -1){
            var day = moment(i).format("DD.MM")
            datesArray.push(day)
        }
    }
    return datesArray
};





function reduceData(hC){ 
    var array = [];
    for (var key in hC){
        array.push(hC[key][hC[key].length-1])
    }
    MIN_NUMBER = array.sort((a, b) => a - b)[array.length-15];
//    console.log(array,MIN_NUMBER)
    return Object.keys(hC).reduce(function(r, e) {
        if ((hC[e][58]>=MIN_NUMBER)) r[e] = hC[e]
        return r;
    }, {})
    ARRAYOFCOUNTRIES = Object.keys(filteredByNumber);
    return filteredByNumber;
}

function init(canvasID){
    var ctx = document.getElementById(canvasID).getContext('2d');
    var config = {
        type: 'line',
        plugins: [ChartDataLabels],
        options:{
            plugins: {
                datalabels: {
                    formatter: function(value, context) {
                        //console.log(value, context)
                        return context.dataset.label + ': ' + value + " " + status;
                    },
                    display: function(context) {
                        //console.log(context);
                        var i = context.dataset.data[context.dataset.data.length-1]?1:2;
                        return context.dataset.data.length-i == context.dataIndex
                    },
                    align: 'left',
                    font: {
                        //family:'"Lucida Console", Monaco, monospace',
                        size: 14,
                        style: 'bold'

                    }
                },
                
            },
            responsive: true,
            showTooltips: true,            
            tooltips: {
                mode: 'index',
                backgroundColor: '#f14668',
                position: 'nearest',
                intersect: false,
                callbacks: {
                  label: function(tooltipItem, data) {
                    var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                    return datasetLabel + ' : ' + tooltipItem.yLabel + ' Menschen';
                  }
                }
            },
            maintainAspectRatio: false,
            legend: {
                usePointStyle:  true,
                display: true,
                position: 'bottom',
                onHover: () => document.body.style.cursor = 'pointer',
                onLeave: () => document.body.style.cursor = 'default',
                fullWidth: false,
                labels:{
                    boxWidth: 0,
                    usePointStyle: true,
                }
            },
            scales: {
                yAxes: [{
                    
                    position: 'left',
                    gridLines: {
                        display:false
                    },
                }],
                xAxes: [{
                    gridLines: {
                        display:false
                    },
                    
                }]
            }
        },
        
        data: { 
            labels: labels, 
            datasets: dataWithCountries
        },

    };
    myChart = new Chart(ctx, config);
}


function fettchULR(choise, cb){
    Papa.parse(choise, {
        download: true,
        header: true,
        worker: true,
        dynamicTyping: true,
        complete: function(results) {
            cb(results);
        }
    });
}





function newULR(urlType){
    if(urlType == 'dead') {
        choise = URL_DEATHS;
        MIN_NUMBER = 10;
        status = 'verstorben';
    }
    else if(urlType == 'recovered') {
        choise = URL_RECOVER;
        MIN_NUMBER = 10;
        status = 'genesen';
    }
    else {
        choise = URL;
        MIN_NUMBER = 1000;
        status = 'infiziert'
    }
}

function  update(newURL){
    if(newURL)newULR(newURL)
    dataWithCountries = [];
    fettchULR(choise, parseData);
    
    function parseData(results){
        //buildUpHashMap
        let hC = {};
        results.data.forEach(function(a){
            var x = a['Country/Region'];
            hC[x] ? hC[x] = addTimeSeries(hC[x],extractTimeseriesFromObject(a)) : hC[x] = extractTimeseriesFromObject(a)
        })
        var filteredByNumber = reduceData(hC);
        labels = createDataLabels(results.data[0]);
        //console.log(Object.keys(filteredByNumber).length);
        
        if(!myChart) init(canvasDOM);
        updateData(filteredByNumber);
    }
}

function createChart(domID){
    fetch(URL, function(){})
    .then(function(){
        document.getElementById(domID).innerHTML = `
        <div class="chart-container">
        
        <div class="chart-item-header is-grouped-centered">
        <div class="field has-addons ">
        <p class="control c_changer">
        <button class="button is-small is-danger" value="ill">
        <span>Infiziert</span>
        </button>
        </p>
        <p class="control c_changer">
        <button class="button is-small" value="dead">
        <span>Tod</span>
        </button>
        </p>
        <p class="control c_changer">
        <button class="button is-small" value="recovered">
        <span>Genesen</span>
        </button>
        </p>
        </div>
        </div> 
        <canvas class="chart-item-body"  id="c_chartCanvas"></canvas>
        <div class="help chart-item-header has-text-centered"><span id="timeToUpdate"></span></div>
        </div>
        `;
        var buttons = document.querySelectorAll('.c_changer>button');
        buttons.forEach(function(button){
            button.addEventListener('click',function(){
                buttons.forEach((b) => b.classList.remove("is-danger"));
                button.classList.add('is-danger')
                update(button.value)
            })
        });
    
        var x = document.getElementById('timeToUpdate');
        x.innerHTML = "Neue Chartdaten sind " + moment.utc().endOf('day').fromNow() + " verüfgbar";  
        //moment().fromNow();
        console.log(moment);
        moment.utc().endOf('day').fromNow(); 
        moment.utc("20120620", "YYYYMMDD").fromNow();

        setCanvas('c_chartCanvas');
        update('ill');
    }).catch((error) => {
        console.error('Error:', error);
    });
    
    
}

export default {createChart}