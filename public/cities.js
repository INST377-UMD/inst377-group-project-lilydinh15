//Populates selects with the city names
function populateCities() {
  fetch(`https://api.sheety.co/9d44a8f14e0fe330df906156bc9878b6/cities/cities`)
  .then((response) => response.json())
  .then(data => {

    var list = data.cities;
    var options = [];
    var values = document.getElementById('cityvalues1');
    var values2 = document.getElementById('cityvalues2');


    list.forEach(city => {
      var text = city.name;
      var value = city.code;
      var option = document.createElement('option');
      option.value = value;
      option.text = text;
      values.add(option);

      var option2 = option.cloneNode(true)
      values2.add(option2);
    })
    
  })
}

window.onload = populateCities;

const ctx = document.getElementById('myChart');

// Loads City data based on user input
async function loadData() {

  var summary1 = document.getElementById('citysum1');
  var summary2 = document.getElementById('citysum2');
  summary1.innerHTML = ""
  summary2.innerHTML = ""
  var score1 = [];
  var score2 = [];
  var city1 = [];
  var city2 = [];
  const citycode1 = document.getElementById('cityvalues1').value;
  const citycode2 = document.getElementById('cityvalues2').value;

  const selectname1 = document.getElementById('cityvalues1');
  var selectedCity1 = selectname1.options[selectname1.selectedIndex];
  var cityname1 = selectedCity1.text

  const selectname2 = document.getElementById('cityvalues2');
  var selectedCity2 = selectname2.options[selectname2.selectedIndex];
  var cityname2 = selectedCity2.text

  const cityscore1 = document.getElementById('cityscore1');
  const cityscore2 = document.getElementById('cityscore2');
  const city_img1 = document.getElementById('city_img1');
  const city_img2 = document.getElementById('city_img2');
  var error = document.getElementById('error');

  let chartStatus = Chart.getChart("myChart"); 
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }

  if(citycode1 === citycode2) {
    error.innerHTML = "Cannot Compare the same city."
    error.style.color = 'orange';
    return;
  } else {
    error.innerHTML = ""
  }

  var images = document.querySelectorAll('.cityimage');
  images.forEach(function(element) {
    element.remove();
  });

  var city = citycode1;
  var cityname = cityname1;
  var scores = city1;
  var overall = score1;
  var summary = summary1;
  var cityscore = cityscore1;
  var labels = [];
  var image = city_img1;

  for(let i = 1; i <= 2; i++) {
    try {
      var source = await getImage(city);
      var photo = createImg(source);

      var data = await fetch(`https://api.teleport.org/api/urban_areas/slug:${city}/scores/`)
        .then((res) => res.json());

        var categories = data.categories;
        summary.innerHTML = data.summary;
        summary.style.color = "white";
        overall.push(Math.floor(data.teleport_city_score));
        cityscore.innerHTML = `${cityname} score: ${overall.toString()}`;



        image.appendChild(photo);
        
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
    
        city = citycode2;
        cityname = cityname2;
        scores = city2;
        overall = score2;
        summary = summary2;
        cityscore = cityscore2;
        image = city_img2;

    } catch (error) {
      summary.innerHTML = "City not in database, spelled incorrectly, missing state , or input is missing.";
      summary.style.color = "red";
      cityscore.innerHTML = "";

      if(i == 1){
        city = citycode2;
        cityname = cityname2;
        scores = city2;
        overall = score2;
        summary = summary2;
        cityscore = cityscore2;
        image = city_img2;
        
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

// Gets the table of previous comparisons
async function getComparisons() {
  var test = await fetch('http://localhost:4000/comparisons', {
      method: 'GET',
      headers: {
        "Content-type": "application/json"
      }
  })
  .then(async (res) => {
    console.log('Status:', res.status)
    if(res.status != 200 && res.status != 304) {
      throw new Error(JSON.stringify(await res.json()));
    } 
    return res.json()
  })
  .then((res) => {
    console.log(res)

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
    tableRow.appendChild(tableHeading4)

    table.appendChild(tableRow)
  
    document.body.appendChild(table)
    for (i = 0; i < res.length; i++) {
      var comparisonRow = document.createElement('tr');
      var comparisonCity1 = document.createElement('td');
      var cityScore1 = document.createElement('td');
      var comparisonCity2 = document.createElement('td');
      var cityScore2 = document.createElement('td');

      comparisonCity1.innerHTML = res[i].cityname1;
      cityScore1.innerHTML = res[i].cityscore1;
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

// Adds user comparison into supabase table
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

// Returns an image based on the city name
async function getImage(city) {
  var imageData = await fetch(`https://api.teleport.org/api/urban_areas/slug:${city}/images/`)
  var photoInfo = await imageData.json();

  var webImage = photoInfo.photos[0].image;
  var source = webImage.web;

  return source;
}

// Creates an image element with the source
function createImg(source){
  var image = document.createElement("img");

  image.src = source;
  image.className = "cityimage img-fluid";
  image.style.height = "110px";

  return image;
}
