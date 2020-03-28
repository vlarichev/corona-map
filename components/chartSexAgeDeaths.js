import Chart from "chart.js/dist/Chart.min";

var color = Chart.helpers.color;

const _alphaF = 0.5;

var horizontalBarChartData = {
    labels: ['30-39 Jahre','40-49 Jahre','50-59 Jahre','60-69 Jahre','70-79 Jahre','80-89 Jahre','90+ Jahre'],
    datasets: [{
        label: 'Frauen',
        backgroundColor: color('blue').alpha(_alphaF).rgbString(),
        borderColor: 'blue',
        borderWidth: 1,
        data: [0.00,0.25,0.70,1.55,7.89,14.23,4.49]
    },
    {
        label: 'Männer',
        backgroundColor: color('red').alpha(_alphaF).rgbString(),
        borderColor: 'red',
        borderWidth: 1,
        data: [0.25,0.35,2.10,7.09,27.41,28.31,5.39]
    }/*,{
        label: 'Gesamt',
        backgroundColor: color('black').alpha(_alphaF).rgbString(),
        borderColor: 'black',
        borderWidth: 1,
        data: [0.25,0.60,2.80,8.64,35.30,42.54,9.89]
    }*/]

};



export default function plotGeschlecht(domID){
    var ctx = document.getElementById(domID).getContext('2d');
    var geschlechtBar = new Chart(ctx, {
        type: 'bar',
        data: horizontalBarChartData,
        options: {
            // Elements options apply to all of the options unless overridden in a dataset
            // In this case, we are setting the border of each horizontal bar to be 2px wide
            elements: {
                rectangle: {
                    borderWidth: 2,
                }
            },
            maintainAspectRatio: false,
            responsive: true,
            tooltips: {
                callbacks: {
                  label: function(tooltipItem, data) {
                    //get the concerned dataset
                    var dataset = data.datasets[tooltipItem.datasetIndex];
                    //calculate the total of this data set
                    return dataset.label + " " + dataset.data[tooltipItem.index] + "%";
                  }
                }
              },
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Ergebnisse der Italienischen Studie aus März 2020 (Untersuchung von 2003 Todesfälle)'
            },
            scales: {
                xAxes: [{
                    //stacked: true,
                    categoryPercentage: .5,
                    barPercentage: 1,
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 60
                    }
                }],
                yAxes: [{
                    //stacked: true,
                    ticks: {
                        suggestedMax: 60
                  }
                }]
              },
              hover: {
                animationDuration: 0
            },
                      animation: {
                        duration: 0,
                        onComplete: function () {
                            // render the value of the chart above the bar
                            var ctx = this.chart.ctx;
                            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
                            ctx.fillStyle = this.chart.config.options.defaultFontColor;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            this.data.datasets.forEach(function (dataset) {
                                for (var i = 0; i < dataset.data.length; i++) {
                                    var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                                    ctx.fillText(Math.round(dataset.data[i] * 10) / 10 + "%", model.x + 0, model.y+0);
                                }
                            });
                        }}
        }});

};