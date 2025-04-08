const { Client } = require("pg"); // Importerar PostgreSQL-klienten
const express = require("express"); // Importerar Express för att skapa en webserver
require("dotenv").config(); // Hämtar miljövariabler från .env

const app = express(); // Skapar en instans av Express
const bodyParser = require("body-parser"); // Importerar body-parser för att hantera POST-data
app.set("view engine", "ejs"); // Sätter EJS som view engine för renderingen
app.use(express.static("public")); // Gör offentliga filer tillgängliga
app.use(bodyParser.urlencoded({ extended: true })); // Aktiverar hantering av formulärdata

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
// Försöker ansluta till databasen och skriver ut eventuella fel
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
        const courses = await client.query("SELECT id, coursecode, coursename, syllabus, progression FROM courses ORDER BY created_at ASC");
        res.render("index", { courses: courses.rows }); // Hämtar kurserna till indexsidan
    } catch (error) {
        console.error(error);
    }
});

app.get("/add", async (req, res) => {
    res.render("add", { errors: {} });  // Hämtar formuläret utan några fel
})

app.post("/add", async (req, res) => {
    try {
        // Hämtar värden från formuläret och trim för att att undvika blank steg
        const coursecode = req.body.coursecode.trim();
        const coursename = req.body.coursename.trim();
        const syllabus   = req.body.syllabus.trim();
        const progression = req.body.progression.trim();

        const errors = []; // Lista för att spara eventuella valideringsfel
    
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
        
        // Om det finns valideringsfel, rendera om sidan med felen
        if (errors.length > 0) {
            return res.render("add", {
                errors,
                coursecode,
                coursename,
                syllabus,
                progression
            });
        }

        // Om valideringen är ok, lägg till kursen i databasen
        await client.query(
            "INSERT INTO courses (coursecode, coursename, syllabus, progression) VALUES ($1, $2, $3, $4)",
            [coursecode, coursename, syllabus, progression]
        );
        res.redirect("/"); // Omdirigerar till startsidan efter att kursen har lagts till
    } catch(error) {
        console.error(error);
    }
});

app.post("/delete/:id", async (req, res) => {
    const courseId = req.params.id; // Hämtar kursens id från URL-parametern
    try {
        // Tar bort kursen från databasen med angivet id
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