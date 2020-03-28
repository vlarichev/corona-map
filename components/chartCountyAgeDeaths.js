import Chart from "chart.js/dist/Chart.min";

var color = Chart.helpers.color;

const _alphaF = 0.5;

var horizontalBarChartData = {
    labels: ['0 bis 9', '10 bis 19', '20 bis 29', '30 bis 39', '40 bis 49', '50 bis 59', '60 bis 69', '70 bis 79', '80+'],
    datasets: [{
        label: 'Fälle in Hubei, China, Januar und Februar 2020, medRxiv',
        backgroundColor: color('blue').alpha(_alphaF).rgbString(),
        borderColor: 'blue',
        borderWidth: 1,
        data: [ 0.01, 0.2, 0.9, 0.18, 0.4, 1.3, 4.6, 9.8, 18]
    },
    {
        label: 'China CDC weekly, Stand 11. Februar 2020',
        backgroundColor: color('red').alpha(_alphaF).rgbString(),
        borderColor: 'red',
        borderWidth: 1,
        data: [ 0.0, 0.2, 0.2, 0.2, 0.4, 1.3, 3.6, 8.0, 14.8]
    },{
        label: 'Korean Centers for Disease Control and Prevention (KCDC) in Korea, 2020',
        backgroundColor: color('green').alpha(_alphaF).rgbString(),
        borderColor: 'green',
        borderWidth: 1,
        data: [ 0, 0, 0, 0.1, 0.1, 0.4, 1.5, 4.3, 7.2]
    }]

};

export default function plotAlter(domID){
    var ctx = document.getElementById(domID).getContext('2d');
    var horizontalBar = new Chart(ctx, {
        type: 'horizontalBar',
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
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Sterblichkeit durch Coronavirus nach Alter und Quelle / fatality rate by age '
            },
            scales: {
                xAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 20
                    }
                }],
                yAxes: [{
                    categoryPercentage: .6,
                    barPercentage: .9,
                  ticks: {
                    reverse: true,
                  }
                }]
              },
              events: false,
    tooltips: {
        enabled: false
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
                            ctx.fillText(dataset.data[i] + "%", model.x + 20, model.y+6);
                        }
                    });
                }}
        }
    });

};