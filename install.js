const { Client } = require("pg");
require("dotenv").config();

//Ansluter till databasen
async function install() {
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

    try {
        await client.connect();
        console.log("Ansluten");

        // Skapar tabellen
        const sql = `
            DROP TABLE IF EXISTS courses;
            CREATE TABLE courses(
                id SERIAL PRIMARY KEY,
                coursecode VARCHAR(20) NOT NULL,
                coursename VARCHAR(100) NOT NULL,
                syllabus VARCHAR(100) NOT NULL,
                progression VARCHAR(1) CHECK (progression IN ('A', 'B', 'C')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(sql);
        console.log("Tabell skapad...");
    } catch(error) {
        console.error(error);
    } finally {
        await client.end();
    }
}
install();