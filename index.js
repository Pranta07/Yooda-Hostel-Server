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
        const studentsCollection = database.collection("students");
        const distributionCollection = database.collection("foodDistribution");

        //post api for adding new food item
        app.post("/addFood", async (req, res) => {
            // console.log(req.body);
            const food = req.body;
            const result = await foodsCollection.insertOne(food);
            res.json(result);
        });

        //get api for food items
        app.get("/foods", async (req, res) => {
            const page = req.query.page;
            const cursor = foodsCollection.find({});
            const count = await cursor.count();
            const foods = await cursor
                .skip(page * 5)
                .limit(5)
                .toArray();
            res.json({ count, foods });
        });

        //edit item/student api
        app.put("/edit/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            const updateDoc = {
                $set: req.body,
            };
            const collection =
                req.query.type === "food"
                    ? foodsCollection
                    : studentsCollection;
            const result = await collection.updateOne(filter, updateDoc);
            res.json(result);
        });

        //api to delete food item or a student
        app.delete("/delete/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            const collection =
                req.query.type === "food"
                    ? foodsCollection
                    : studentsCollection;
            const result = await collection.deleteOne(filter);
            res.json(result);
        });

        //post api for adding new student
        app.post("/addStudent", async (req, res) => {
            const student = req.body;
            const result = await studentsCollection.insertOne(student);
            res.json(result);
        });

        //get api for students
        app.get("/students", async (req, res) => {
            const page = req.query.page;
            const cursor = studentsCollection.find({});
            const count = await cursor.count();
            const students = await cursor
                .skip(page * 5)
                .limit(5)
                .toArray();
            res.json({ count, students });
        });

        //bulk update status api
        app.put("/students/update/:status", async (req, res) => {
            const filter = {
                _id: {
                    $in: req.body.map((id) => ObjectId(id)),
                },
            };
            const updateDoc = {
                $set: {
                    status: req.params.status,
                },
            };
            const result = await studentsCollection.updateMany(
                filter,
                updateDoc
            );
            res.json(result);
        });

        //get api for a single student
        app.get("/student/:roll", async (req, res) => {
            const query = { roll: req.params.roll };
            const result = await studentsCollection.findOne(query);
            res.json(result);
        });

        //get api for all foods
        app.get("/allFoods", async (req, res) => {
            const result = await foodsCollection.find({}).toArray();
            res.json(result);
        });

        //post api for distributing foods
        app.post("/disFood", async (req, res) => {
            const data = req.body;
            const query = {
                studentId: data.studentId,
                date: data.date,
                shift: data.shift,
            };

            const result1 = await distributionCollection.findOne(query);
            const result2 = await studentsCollection.findOne({
                roll: data.studentId,
            });

            if (!result1 && result2) {
                const result = await distributionCollection.insertOne(data);
                res.json(result);
            } else if (!result2) {
                res.json({
                    msg: "This id is not valid! Put a valid id Please!",
                });
            } else {
                res.json({ msg: "Already Served!" });
            }
        });
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
