
const ctx = document.getElementById('myChart');

async function loadData() {

  var summary1 = document.getElementById('citysum1');
  var summary2 = document.getElementById('citysum2');
  summary1.innerHTML = ""
  summary2.innerHTML = ""

  var score1 = [];
  var score2 = [];

  var city1 = [];
  var city2 = [];
  const cityname1 = document.getElementById('city1').value;
  const cityname2 = document.getElementById('city2').value;
  const cityscore1 = document.getElementById('cityscore1');
  const cityscore2 = document.getElementById('cityscore2');

  var error = document.getElementById('error');

  let chartStatus = Chart.getChart("myChart"); 
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  if(cityname1 === cityname2) {
    error.innerHTML = "Cannot Compare the same city."
    error.style.color = 'orange';
    return;
  } else {
    error.innerHTML = ""
  }

  var city = cityname1.toLowerCase().replace(/[\s,]+/g, '-');
  var input = cityname1;
  var scores = city1;
  var overall = score1;
  var summary = summary1;
  var cityscore = cityscore1;
  var labels = [];

  for(let i = 1; i<=2; i++) {
    try {
      var data = await fetch(`https://api.teleport.org/api/urban_areas/slug:${city}/scores/`)
        .then((res) => res.json());

        var categories = data.categories;
        summary.innerHTML = data.summary;
        summary.style.color = "white";
        overall.push(Math.floor(data.teleport_city_score));
        cityscore.innerHTML = `${input.charAt(0).toUpperCase() + input.slice(1)} score: ${overall.toString()}`
        
        if(overall <= 50) {
          cityscore.style.color = "red";
        } else if (overall > 50 && overall < 65){
          cityscore.style.color = "yellow";
        } else {
          cityscore.style.color = "green";
        }
        categories.forEach(element => {
          labels.push(element.name);
          scores.push(element.score_out_of_10);
        })
    
        city = cityname2.toLowerCase().replace(/[\s,]+/g, '-');
        input = cityname2
        scores = city2;
        overall = score2;
        summary = summary2;
        cityscore = cityscore2;

    } catch (error) {
      summary.innerHTML = "City not in database, spelled incorrectly, missing state , or input is missing.";
      summary.style.color = "red";
      cityscore.innerHTML = "";

      if(i == 1){
        city = cityname2.toLowerCase().replace(/[\s,]+/g, '-');
        scores = city2;
        input = cityname2;
        overall = score2;
        summary = summary2;
        cityscore = cityscore2;
        
      } else {
        return;
      }
    }
  }
  
  addComparison(cityname1, score1[0].toString(), cityname2, score2[0].toString());
  getComparisons();

  const ctx = document.getElementById('myChart');
  
  if(summary1.innerHTML != "City not in database, spelled incorrectly, missing state , or input is missing.") {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.slice(0,15),
        datasets: [{
          label: cityname1,
          data: city1.slice(0,15),
          borderWidth: 1,
          backgroundColor: 'white',
        }, {
          label: cityname2,
          data: city2.slice(0,15),
          borderWidth: 1,
          backgroundColor: 'orange',
        }]
      }
    });
  }
}

async function getComparisons() {
  var test = await fetch('http://localhost:4000/comparisons', {
      method: 'GET',
      headers: {
        "Content-type": "application/json"
      }
  })
  .then((res) => {
    console.log(res)
    
    console.log(res);
    const element = document.getElementById("comparisonTable");
    if (element) {
      element.remove();
    }

    var table = document.createElement('table');
    table.setAttribute('id', 'comparisonTable')

    var header = table.createTHead();
    var row = header.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = "Previous Comparisons"

    var tableRow = document.createElement('tr');

    var tableHeading1 = document.createElement('th');
    tableHeading1.innerHTML = "City 1"
    tableRow.appendChild(tableHeading1)

    var tableHeading2 = document.createElement('th');
    tableHeading2.innerHTML = "City 1 Score"
    tableRow.appendChild(tableHeading2)

    var tableHeading3 = document.createElement('th');
    tableHeading3.innerHTML = "City 2"
    tableRow.appendChild(tableHeading3)

    var tableHeading4 = document.createElement('th');
    tableHeading4.innerHTML = "City 2 Score"
    tableRow.appendChild(tableHeading3)

    table.appendChild(tableRow)
      // var cutoff = document.getElementById('cutoff');
      // cutoff.insertAdjacentElement("beforebegin", table)
    document.body.appendChild(table)
    for (i = 0; i < res.length; i++) {
      var comparisonRow = document.createElement('tr');
      var comparisonCity1 = document.createElement('td');
      var cityScore1 = document.createElement('td');
      var comparisonCity2 = document.createElement('td');
      var cityScore2 = document.createElement('td');

      comparisonCity1.innerHTML = res[i].cityname1;
      cityScore1.innerHTML = res[i].cityscore2;
      comparisonCity2.innerHTML = res[i].cityname2;
      cityScore2.innerHTML = res[i].cityscore2;

      comparisonRow.appendChild(comparisonCity1);
      comparisonRow.appendChild(cityScore1);
      comparisonRow.appendChild(comparisonCity2);
      comparisonRow.appendChild(cityScore2);

      table.appendChild(comparisonRow);
    }
  })
}

async function addComparison(name1, score1, name2, score2) {
  var test = await fetch(`http://localhost:4000/cities`, {
    method: 'POST',
    body: JSON.stringify({
      "cityname1": name1,
      "cityscore1": score1,
      "cityname2": name2,
      "cityscore2": score2,
    }),
    headers: {
      "Content-type": "application/json"
    }
  })
}