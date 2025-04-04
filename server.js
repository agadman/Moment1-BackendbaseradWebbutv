const { Client } = require("pg");
const express = require("express");
require("dotenv").config();

const app = express();
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // Aktiverar formulärdata

//Ansluter till databasen
const client = new Client ({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false,
    },
}); 

client.connect((err) => {
    if(err) {
        console.log("Fel vid anslutning: " + err);
    } else {
        console.log("Ansluten till databasen...");
    }
});

//Routing
app.get("/", (req, res) => {
    res.render("index");
})

app.get("/add", (req, res) => {
    res.render("add");
})

app.post("/add", (req, res) => {
    res.render("add");
})

app.get("/about", (req, res) => {
    res.render("about");
})

//Starta applikationen
app.listen(port, () => {
    console.log("Server started on: " + port);
})