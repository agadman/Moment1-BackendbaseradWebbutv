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
app.get("/", async (req, res) => {
    try {
        const courses = await client.query("SELECT id, coursecode, coursename, syllabus, progression FROM courses");
        res.render("index", { courses: courses.rows });
    } catch (error) {
        console.error(error);
    }
});

app.get("/add", async (req, res) => {
    res.render("add", { errors: {} }); 
})

app.post("/add", async (req, res) => {
    try {
        const coursecode = req.body.coursecode.trim();
        const coursename = req.body.coursename.trim();
        const syllabus   = req.body.syllabus.trim();
        const progression = req.body.progression.trim();

        const errors = [];
    
        // Validering av input fält
        if (!coursecode) {
            errors.push("Kurskod är obligatorisk.");
        }
        if (!coursename) {
            errors.push("Kursnamn är obligatoriskt.");
        }
        if (!syllabus) {
            errors.push("Kursplan är obligatorisk.");
        }
        if (!progression) {
            errors.push("Progression är obligatorisk.");
        }
    
        if (errors.length > 0) {
            return res.render("add", {
                errors,
                coursecode,
                coursename,
                syllabus,
                progression
            });
        }

        await client.query(
            "INSERT INTO courses (coursecode, coursename, syllabus, progression) VALUES ($1, $2, $3, $4)",
            [coursecode, coursename, syllabus, progression]
        );
        res.redirect("/"); 
    } catch(error) {
        console.error(error);
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

app.get("/about", async (req, res) => {
    res.render("about");
})

//Startar upp servern
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server started on: " + port);
})