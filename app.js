process.stdin.setEncoding('utf8')
const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'templates'))
require('dotenv').config({
  path: path.resolve(__dirname, 'credentialsDontPost/.env')
})
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
app.listen(portNumber)
console.log(`Web server starting and running at http://localhost:${portNumber}`)
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (request, response) => {
  response.render('index')
})
app.get('/register', (request, response) => {
  response.render('register')
})
app.get('/login', (request, response) => {
  const variable = {
    error: ''
  }
  response.render('login', variable)
})

app.post('/form', (request, response) => {
  const { maxPrice } = request.body
  console.log(`Max price is: ${maxPrice}`)
  let apiURL = `https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=${maxPrice}`
  let dealsResult = ''

  ;(async () => {
    try {
      const apiResponse = await fetch(apiURL)
      console.log(apiURL)
      const data = await apiResponse.json()
      console.log(data)
      if (data.length === 0) {
        dealsResult += `Sorry, no deals matched your search.`
      } else {
        data.forEach(deal => {
          dealsResult += `<div class="dealElemBox">
                            Title: ${deal.title}, Sale Price: ${deal.salePrice}, Normal Price: ${deal.normalPrice}
                        </div>`
        })
      }
      let variables = {
        dealsData: dealsResult
      }
      response.render('deals', variables)
    } catch (error) {
      console.error(`Couldnt get the data. ${error}`)
    }
  })()
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
  let { firstname, lastname, email } = request.body
  let data = await lookup(firstname, lastname, email)
  if (data === undefined) {
    const variable = {
      error: "You don't have an account. Please register."
    }
    response.render('login', variable)
  } else {
    let result =
      '<strong>First Name: </strong>' +
      data.firstname +
      '<br><strong>Last Name: </strong>' +
      data.lastname +
      '<br><strong>Email Address: </strong>' +
      data.email
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

async function lookup (firstname, lastname, email) {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING)
    const result = await Profile.find({
      FirstName: firstname,
      LastName: lastname,
      Email: email
    })
    if (result === undefined) {
      return result
    }
    return {
      firstname: result.FirstName,
      lastname: result.LastName,
      email: result.Email
    }
  } catch (err) {
    console.error(err)
  }
}
