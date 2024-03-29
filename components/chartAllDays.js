import Chart from "chart.js/dist/Chart.min";


const urlWiki = "https://de.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=" + wikiPageAdress;


function print(parsedTabe, pointsLibrary) {
    var chart = new MapChart(parsedTabe, pointsLibrary);
    chart.print();
}

/// Wiki
function getLastDataFromWiki() {
    //fetch WIKI to get Table
    return fetch(urlWiki).then(function (response) {
        return response.json();
    })
        .then(function (response) {
            var html_code = response["parse"]["text"]["*"];
            //var parser = new DOMParser();
            var html = parser.parseFromString(html_code, "text/html");
            var tables = html.querySelectorAll(".wikitable tbody")[1];
            console.log(tables)

            // struktur array[BundeslandID] = [werte....,null]
            var parsedTabe = parseWiki(tables);

            setTimeout(print(parsedTabe, pointsLibrary), 5000);

        });
}

function parseWiki(table) {
    var wikiTable = [];
    var c = table.rows;
    var blId = 1;
    for (var row in c) {
        var skipSpalte = 0;
        if (!c[row].className && typeof (c[row]) == "object") {
            var spalten = c[row].children;
            //console.log(spalten)
            wikiTable[blId] = [];
            for (var index in spalten) {
                if (skipSpalte > 0) {
                    wikiTable[blId].push(tryToParse(spalten[index].innerHTML))
                }
                skipSpalte++;
            }
            blId++;
        }
    }
    return wikiTable;
}



function tryToParse(num) {
    if (parseInt(num)) return parseInt(num.replace(".", ""));
    else return null;
}

export class MapChart {
    constructor(data, store) {
        this.data = data;
        var labels = [];
        var sumOfArray = [];
        const dayAgo = 4;
        var colorArray = ["", "#555e7b", "#f4da93", "#b576ad", "#e04644", "#fde47f", "#7ccce5", "#b8c948", "#92a9db", "#f4da93", "#ee823f", "#67e0a1", "#d60a69", "#ce322f", "#3ed6ab", "#9fbee0", "#e206d0"];
        function returnOrgange(a) {
            return true
        }
        function getRandomColor(a) {
            var o = Math.round, r = Math.random, s = 255, alpha = a;
            return 'rgba(' + '180,' + o(r() * s) + ',' + o(r() * s) + ',';
        }
        function dummyLabels() {

            data[1].forEach(a => labels.push(""));
            //console.log(data)
            var newL = labels.slice(0, labels.length - dayAgo)
            newL[newL.length - 2] = ((new Date()).getDate()).toString();
            return newL;
        };
        function createDataSet(name, data, i) {
            //console.log(name, data, i)
            var _color = getRandomColor();
            function mixColor(a) { return _color + a + ")"; }

            function selectColor(number) {
                const hue = number * 137.508; // use golden angle approximation
                return `hsl(${hue},50%,75%)`;
            }
            var color = selectColor(Math.floor(Math.random() * 360) + 1);
            return {
                label: name,
                data: data,
                backgroundColor: colorArray[i],
                hoverBackgroundColor: colorArray[i],
                borderColor: "white",
                borderWidth: 1
            }
        }
        function createLine(array) {
            return {
                label: "Summe",
                data: array,
                borderWidth: 3,
                fill: true,
                radius: 0,
                borderColor: "#fa852e",
                //lineTension: 0,
                //borderDash: [10,10],
                cubicInterpolationMode: "monotone",
                //backgroundColor: "#ee823f"
                type: "line"
            }
        }
        function returnDataSet() {
            var dataArray = [];

            for (var blId in store) {
                var row = data[blId];
                if (row) {

                    var name = store[blId].name;
                    console.log(row)
                    if (sumOfArray.length == 0) {
                        sumOfArray = row;
                    } else {
                        sumOfArray = sumOfArray.map(function (num, idx) {
                            return num + row[idx];
                        });
                    }
                    var dataSet = createDataSet(name, row, blId);
                    //console.log(dataSet)
                    dataArray.push(dataSet);
                }
            }
            console.log(sumOfArray)
            labels = sumOfArray;
            dataArray.push(createLine(sumOfArray))
            return dataArray;
        };
        this.filter = function (id) {
            //console.log("focusing "+ id)
        }
        this.print = function () {


            getLastDataFromWiki();

            var ctx = document.getElementById('myChart').getContext('2d');
            var chart = new Chart(ctx, {
                type: 'bar',
                animation: {
                    duration: 6000,
                    easing: "easeOutCubic"
                },
                data: {
                    labels: dummyLabels(),
                    datasets: returnDataSet()
                },
                options: {
                    title: {
                        display: true,
                        text: 'Coronafälle pro Tag (nach RKI)'
                    },
                    responsive: true,
                    //hover: {mode: null},
                    maintainAspectRatio: false,
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: "start",
                        labels: {
                            usePointStyle: false,
                            boxWidth: 10,
                        }
                    },
                    scales: {
                        yAxes: [{
                            stacked: true,
                            ticks: { beginAtZero: true }
                        }],
                        xAxes: [{
                            stacked: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Tage",
                                padding: 1
                            }
                        }]
                    }
                }
            });
        };
    }
}
