const express = require('express');
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const { asyncWrapProviders } = require('async_hooks');
const portNumber = process.env.PORT || 4000;


if (process.argv.length !== 2){
    process.stdout.write("Usage app.js");
    process.exit(1);
}

app.listen(portNumber); 
console.log(`Web server starting and running at http://localhost:${portNumber}`);

app.use(bodyParser.urlencoded({extended:false}));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.use(express.static(path.join(__dirname, 'public')));
app.get("/", (request, response) => {
    let portLink = `http://localhost:${portNumber}/`;
    let variables = {
        portNumberLink:portLink
    }
    response.render("index", variables);
});

app.post("/", (request, response) => {
    const {maxPrice} = request.body;
    console.log(`Max price is: ${maxPrice}`);
    let apiURL = `https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=${maxPrice}`;
    let dealsResult = "";
    
    (async () =>{
        try {
            const apiResponse = await fetch(apiURL);
            console.log(apiURL);
            const data = await apiResponse.json();
            console.log(data);
            if (data.length === 0){
                deals += `Sorry, no deals matched your search.`
            } else {
                data.forEach(deal => {
                    dealsResult+=
                        `<div class="dealElemBox">
                            Title: ${deal.title}, Sale Price: ${deal.salePrice}, Normal Price: ${deal.normalPrice}
                        </div>`;
                })
            }
            let variables = {
                dealsData: dealsResult
            };
            response.render("deals", variables);
        } catch (error) {
            console.error(`Couldnt get the data. ${error}`);
        }
    })();
});


