 //parse wiki:
 const urlWiki = "https://de.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=" + "COVID-19-F%C3%A4lle_in_Deutschland";


 function wartung(){
    var modal = document.querySelector('#wartung');  // assuming you have only 1
    var html = document.querySelector('html');
    modal.classList.add('is-active');
    html.classList.add('is-clipped');
  
    modal.querySelector('.modal-background').addEventListener('click', function(e) {
      e.preventDefault();
      modal.classList.remove('is-active');
      html.classList.remove('is-clipped');
    });
}



 function getLastDataFromWiki(){
    //fetch WIKI to get Table
    return fetch(urlWiki)
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        var html_code = response["parse"]["text"]["*"];
        var parser = new DOMParser();
        var html = parser.parseFromString(html_code, "text/html");
        var tables = html.querySelectorAll(".wikitable");
        //console.log(tables)

        var parsedTabe = tableToJson(tables[0]);
        allData = parsedTabe;
        //console.log(parsedTabe)
        table2land(parsedTabe)
    });
}
var daysAgo = 1;
var arrayOfDates;

var el = document.createElement( 'html' );

//var SizeOfObject = (table) => Object.keys(table[0]).length-1;


 function table2landOld(table){
    //var todayIndex = SizeOfObject(table);
    
    console.log(table)
    arrayOfDates = Object.keys(table[0]);
    
    var lastDate = arrayOfDates[arrayOfDates.length-1 - daysAgo];
    console.log(lastDate);
    printDate(lastDate);

    for (var entry in table){
        
        var zeile = table[entry]
        
        var varLastDate = zeile[Object.keys(zeile)[Object.keys(zeile).length - 1 - daysAgo]]
        
        
        var x = zeile["bundesland\n"];
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

function parseNumers (num){
    if (parseInt(num)) return parseInt(num);
    else return 0;
};


//// chartJs Legend:

document.getElementById('chart-legends').innerHTML = chart.generateLegend();
            
document.getElementById('chart-legends').addEventListener('click', function() {
    //chart.data.datasets[0].data[$(this).index()] += 50;
    chart.update();
    console.log('legend: ' + chart.data.datasets[0].data);
  });
  
  document.getElementById('mapid').addEventListener('click', function(evt) {
    var activePoints = chart.getElementsAtEvent(evt);
    var firstPoint = activePoints[0];
    if (firstPoint !== undefined) {
      console.log('canvas: ' + 
      data.datasets[firstPoint._datasetIndex].data[firstPoint._index]);
    } 
    else {
      chart.data.labels.push("New");
      chart.data.datasets[0].data.push(100);
      chart.data.datasets[0].backgroundColor.push("red");
      chart.options.animation.animateRotate = false;
      chart.options.animation.animateScale = false;
      chart.update();
      document.getElementById('chart-legends').innerHTML = chart.generateLegend();

    }
});