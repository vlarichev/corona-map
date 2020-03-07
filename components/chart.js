import Chart from "../node_modules/chart.js/dist/Chart.min.js";
import "../css/map.css";


export class MapChart {
    constructor(data,store) {
        this.data = data;
        function getRandomColor(a) {
            var o = Math.round, r = Math.random, s = 255, alpha = a;
            return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',';
        }    
        function dummyLabels(){
            var labels = [];
            data[1].forEach(a => labels.push(""));
            console.log(labels)
            var newL = labels.slice(0,labels.length-2)
            return newL;
        };
        function createDataSet(name, data){
            var _color = getRandomColor();
            function mixColor(a){
                return _color + a + ")";
            } 
            return {
                label: name,
                data: data,
                backgroundColor: mixColor(0.05),
                borderColor: mixColor(1),
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
                type: 'line',
                data: {
                    labels: dummyLabels(),
                    datasets: returnDataSet()
                },
                options: {
                    title: {
                        display: true,
                        text: 'Coronafälle pro Tag'
                    },
                    responsive: true,
                    //hover: {mode: null},
                    maintainAspectRatio: false,
                    legend: { 
                        display: true,
                        position: 'bottom',
                        align: "start"
                    },
                    scales: {
                        yAxes: [{
                            ticks: { beginAtZero: true }
                        }]
                    }
                }
            });
        };
    }
}
