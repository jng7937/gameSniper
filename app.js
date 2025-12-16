process.stdin.setEncoding('utf8')
const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
var session = require('express-session')

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'templates'))
require('dotenv').config({
  path: path.resolve(__dirname, 'credentialsDontPost/.env')
});
app.use(express.static(path.join(__dirname, 'public')));
const { MongoClient, ServerApiVersion } = require('mongodb')
const { asyncWrapProviders } = require('async_hooks')
const portNumber = process.env.PORT || 4000
const dataSchema = new mongoose.Schema({
  FirstName: String,
  LastName: String,
  Email: String
})
const Profile = mongoose.model('profile', dataSchema)

if (process.argv.length !== 2) {
  process.stdout.write('Usage app.js')
  process.exit(1)
}

//from express documentation.. using this to send stuff from post to get to render page..
var sess = {
  secret: 'keyboard cat',
  cookie: {}
};

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'keyboard cat'
}))

app.listen(portNumber)
console.log(`Web server starting and running at http://localhost:${portNumber}`)


app.get('/', (request, response) => {
  response.render('index');
})
app.get('/register', (request, response) => {
  response.render('register');
})
app.get('/login', (request, response) => {
  const variable = {
    error: ''
  }
  response.render('login', variable)
});
app.get('/deals', (request, response) => {
  let variables = {
    dealsData: request.session.deals
  }
  response.render('deals', variables);
});

app.post('/deals', (request, response) => {
  let dealsResult = '';
  console.log(`Request body: ${request.body}`);
  const { data } = request.body;
  try{
    
    if (data.length === 0) {
        dealsResult += `Sorry, no deals matched your search.`
    } else {
          data.forEach(deal => {
          dealsResult += `<div class="dealElemBox">
                            <img src=${deal.thumb} alt="(Thumbnail of game)"> 
                            <p>Title: ${deal.title}</p>
                            <p>Sale Price: ${deal.salePrice} Normal Price: ${deal.normalPrice}</p>
                        </div>`;
        });
    }
    let variables = {
        dealsData: dealsResult
    }

    request.session.deals = dealsResult;
    response.sendStatus(200);
  } catch (error) {
    console.error(`Couldnt get the data. ${error}`)
      let variables = {
          dealsData: "ERROR in getting data."
    }
    request.session.deals = dealsResult;
    response.redirect('/deals');
  }
  
})

app.post('/register', (request, response) => {
  let { firstname, lastname, email } = request.body
  database_helper(firstname, lastname, email)
  let result =
    '<strong>First Name: </strong>' +
    firstname +
    '<br><strong>Last Name: </strong>' +
    lastname +
    '<br><strong>Email Address: </strong>' +
    email
  let portLink = `http://localhost:${portNumber}/`
  const variable = {
    data: result,
    portNumberLink: portLink
  }
  response.render('form', variable)
})

app.post('/login', async (request, response) => {
  let {email} = request.body
  let data = await lookup(email)
  if (!data) {
    const variable = {
      error: "You don't have an account. Please register."
    }
    response.render('login', variable)
  } else {
    let result =
      '<strong>First Name: </strong>' +
      data.FirstName +
      '<br><strong>Last Name: </strong>' +
      data.LastName +
      '<br><strong>Email Address: </strong>' +
      data.Email
    let portLink = `http://localhost:${portNumber}/`
    const variable = {
      data: result,
      portNumberLink: portLink
    }
    response.render('form', variable)
  }
})

async function database_helper (firstname, lastname, email) {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING)
    const profile1 = new Profile({
      FirstName: firstname,
      LastName: lastname,
      Email: email
    })
    await profile1.save()
    mongoose.disconnect()
  } catch (err) {
    console.error(err)
  }
}

async function lookup (email) {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING)
    const result = await Profile.findOne({
      Email: email
    })
    mongoose.disconnect()
      return result;
  } catch (err) {
    console.error(err)
  }
}
