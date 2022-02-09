const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("yooda server is running!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yxq3j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const database = client.db("YoodaHostel");
        const foodsCollection = database.collection("foods");

        //post api for adding new food item
        app.post("/addFood", async (req, res) => {
            console.log(req.body);
            const food = req.body;
            const result = await foodsCollection.insertOne(food);
            res.json(result);
        });
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
