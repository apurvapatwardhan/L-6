
import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
})

import connectDB from "./db/index.js";
import app from "./app.js";

const PORT = process.env.PORT || 8000;



connectDB().then(res => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`SERVER RUNNING AT PORT ${PORT}`)
    })
}).catch(err => {
    console.log("MONGO DB CONNECTION FAILED!!!", err);
})





// ;(async function connectDB() {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//     }
//     catch(err) {
//         console.log("ERROR!!!", err);
//     }
// })()

