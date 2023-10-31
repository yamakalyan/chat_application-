const mysql = require("mysql")

const createConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "whatsapp_lite"
})

createConnection.connect((err, results) => {
    if (err) {
        console.log(err)
    } else {
        console.log("successfully connected database")
    }
})

module.exports = createConnection