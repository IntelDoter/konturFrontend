var express = require("express");
var data = require('./data/data.json');
var app = express();

app.listen(3000, function() {
    console.log("API STARTED")
});

app.get("/cities/:city", function(req, res) {
    var result = data.array.filter(function(item) {
        return item.City.indexOf(req.params.city) == 0
    });
    console.log("loaded city list");

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(result);
});

app.get("/favoriteCities", function(req, res) {

    console.log("loaded favorites list");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data.favoriteArray);
});

app.get("/shortArray", function(req, res) {

    console.log("loaded short list");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data.shortArray);
});