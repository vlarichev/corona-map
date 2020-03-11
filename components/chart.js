import Chart from "../node_modules/chart.js/dist/Chart.min.js";
import "../css/map.css";


export class MapChart {
    constructor(data,store) {
        this.data = data;
        function returnOrgange(a){
            return 
        }
        function getRandomColor(a) {
            var o = Math.round, r = Math.random, s = 255, alpha = a;
            return 'rgba('  + '180,' + o(r()*s) + ',' + o(r()*s) + ',';
        }    
        function dummyLabels(){
            var labels = [];
            data[1].forEach(a => labels.push(""));
            console.log(labels)
            var newL = labels.slice(0,labels.length-4)
            return newL;
        };
        function createDataSet(name, data){
            var _color = getRandomColor();
        function mixColor(a){
            return _color + a + ")";
        } 
        function selectColor(number) {
            const hue = number * 137.508; // use golden angle approximation
            return `hsl(${hue},50%,75%)`;
          }
            return {
                label: name,
                data: data,
                backgroundColor: selectColor(Math.floor(Math.random() * 360) + 1  ),
                hoverBackgroundColor:selectColor(Math.floor(Math.random() * 360) + 1  ),
                borderColor: "white",
                borderWidth: 1
            }
        }
        function returnDataSet(){
            var dataArray = [];
            for (var blId in store){
                var row = data[blId]
                var name = store[blId].name
                var dataSet = createDataSet(name,row);
                dataArray.push(dataSet);
            }
            return dataArray;
        };
        this.filter = function(id){
            console.log("focusing "+ id)
        }
        this.print = function(){
            var ctx = document.getElementById('myChart').getContext('2d');
            var chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dummyLabels(),
                    datasets: returnDataSet()
                },
                options: {
                    title: {
                        display: true,
                        text: 'Coronafälle pro Tag (RKI)'
                    },
                    responsive: true,
                    //hover: {mode: null},
                    maintainAspectRatio: false,
                    legend: { 
                        display: true,
                        position: 'bottom',
                        align: "start",
                        labels: {
                            usePointStyle : false,
                            boxWidth: 10
                        }
                    },
                    scales: {
                        yAxes: [{
                            stacked: true,
                            ticks: { beginAtZero: true }
                        }],
                        xAxes: [{
							stacked: true,
						}]
                    }
                }
            });
        };
    }
}
