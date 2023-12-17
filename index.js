const express = require("express")
var bodyParser = require('body-parser')
const supabaseClient = require('@supabase/supabase-js')
const app = express()
const port = 4000
app.use(bodyParser.json())

const supabaseUrl = `https://vtpbptzigquykelrlnuh.supabase.co`
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cGJwdHppZ3F1eWtlbHJsbnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI2NzIzODUsImV4cCI6MjAxODI0ODM4NX0.3modpjGwSVaeFsji4DCm79yMQRPtQ9DJD6_hv54f-Do'
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.use(express.static(__dirname + '/public'))

app.get('/', (req,res) => {
  res.sendFile('public/Week10.html', {root: __dirname})
})

app.get('/comparisons', async (req, res) => {
  console.log('Getting Comparisons')
  
  const {data, error} = await supabase
    .from('Comparisons')
    .select();

    if(error) {
      console.log(error)
    } else if(data) {
      res.send(data)
    }
})

app.post('/cities', async (req, res) => {
  console.log('Adding Comparison')

  var cityname1 = req.body.cityname1;
  var cityscore1 = req.body.cityscore1;
  var cityname2 = req.body.cityname2;
  var cityscore2 = req.body.cityscore2;

  const {data, error} = await supabase
    .from('Comparisons')
    .insert([
      {'cityname1': cityname1, 'cityscore1': cityscore1, 
        'cityname2': cityname2, 'cityscore2': cityscore2}
    ])
    .select();

  console.log(data)
  res.header('Content-type', 'application/json')
  res.send(data)
})


app.listen(port)
