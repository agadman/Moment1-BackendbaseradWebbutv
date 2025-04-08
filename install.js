const { Client } = require("pg");
require("dotenv").config();

//Ansluter till databasen och skapar en ny tabell
async function install() {
    const client = new Client ({
        // Hämtar värden från .env
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: {
            rejectUnauthorized: false, // SSL-anslutning till databasen
        },
    }); 

    try {
        // Ansluter till databasen
        await client.connect();
        console.log("Ansluten");

        // SQL-kod för att skapa tabellen "courses"
        const sql = `
            CREATE TABLE courses(
                id SERIAL PRIMARY KEY,
                coursecode VARCHAR(20) NOT NULL,
                coursename VARCHAR(100) NOT NULL,
                syllabus VARCHAR(100) NOT NULL,
                progression VARCHAR(1) CHECK (progression IN ('A', 'B', 'C')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        // Kör SQL-kommandot för att skapa tabellen
        await client.query(sql);
        console.log("Tabell skapad...");
    } catch(error) {
        // Hanterar eventuella fel vid anslutning eller körning av SQL
        console.error(error);
    } finally {
        // Stänger anslutningen till databasen
        await client.end();
    }
}
install(); // Kör funktionen för att skapa tabellen