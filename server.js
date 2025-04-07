const { Client } = require("pg");
const express = require("express");
require("dotenv").config();

const app = express();
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // Aktiverar formulärdata
const port = process.env.PORT || 3000;

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
    client.query("SELECT id, coursecode, coursename, syllabus, progression FROM courses", (err, result) => {
        if(err) {
            console.log("Fel vid db-fråga: ", err);
        } else {
            res.render("index", {
                courses: result.rows
            });
        }
    });
});

app.get("/add", (req, res) => {
    res.render("add");
})

app.post("/add", async (req, res) => {
    const { coursecode, coursename, syllabus, progression } = req.body;

    try {
        await client.query(
            "INSERT INTO courses (coursecode, coursename, syllabus, progression) VALUES ($1, $2, $3, $4)",
            [coursecode, coursename, syllabus, progression]
        );
        res.redirect("/"); 
    } catch (err) {
        console.error("Fel vid insättning i databasen:", err);
        res.status(500).send("Något gick fel.");
    }
});

app.post("/delete/:id", async (req, res) => {
    const courseId = req.params.id;

    try {
        await client.query("DELETE FROM courses WHERE id = $1", [courseId]);
        res.redirect("/");
    } catch (err) {
        console.error("Fel vid radering:", err);
        res.status(500).send("Något gick fel vid radering.");
    }
});

app.get("/about", (req, res) => {
    res.render("about");
})

//Starta applikationen
app.listen(port, () => {
    console.log("Server started on: " + port);
})