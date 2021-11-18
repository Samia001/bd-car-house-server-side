const express = require("express");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");

require("dotenv").config();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// create uri
const uri =`${process.env.DB_HOST}://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a8pyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// new client
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// server connection
const server = async () => {
  try {
    await client.connect();
    const database = client.db("e_property");
    const userCollection = database.collection("users");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const apartmentCollection = database.collection("apartments");

    // getting product with id
    app.get("/apartment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await apartmentCollection.findOne(query);

      res.json(result);
    });

    // getting all the glasses
    app.get("/apartments", async (req, res) => {
      const limit = +req.query.limit;

      let result;
      if (limit) {
        result = await apartmentCollection
          .find({})
          .sort({ _id: -1 })
          .limit(limit)
          .toArray();
      } else {
        result = await apartmentCollection.find({}).toArray();
      }

      res.json(result);
    });

    // add new glass
    app.post("/apartments", async (req, res) => {
      const result = await apartmentCollection.insertOne(req.body);
      res.send(result);
    });

    app.delete("/apartments/:id", async (req, res) => {
      const result = await apartmentCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });

      res.json(result);
    });

    // get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();

      res.json(result);
    });

    // get all users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();

      res.json(result);
    });

    // get a user
    app.get("/user/:email", async (req, res) => {
      const result = await userCollection.findOne({ email: req.params.email });

      res.json(result);
    });

    // add a review
    app.post("/review", async (req, res) => {
      const review = req.body;

      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // add a order
    app.post("/order", async (req, res) => {
      const order = req.body;

      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // get all order
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      console.log(email);

      let result;
      if (email) {
        result = await orderCollection.find({ email: email }).toArray();
      } else {
        result = await orderCollection.find({}).toArray();
      }

      res.json(result);
    });

    // delete order
    app.delete("/order/:id", async (req, res) => {
      const result = await orderCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });

      res.json(result);
    });

    // approve order
    app.put("/order", async (req, res) => {
      const id = req.query.id;
      const order = req.body;

      const updateDoc = {
        $set: { order: order },
      };

      console.log(id);

      const result = await orderCollection.updateOne(
        { _id: ObjectId(id) },
        updateDoc,
        {
          upsert: false,
        }
      );

      res.json(result);
    });

    // add user to db
    app.put("/users", async (req, res) => {
      const userData = req.body;
      const filter = { email: userData.email };
      const options = { upsert: true };
      const updatedUser = {
        $set: { ...userData },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedUser,
        options
      );
      res.json(result);
    });

    //
    console.log("eProperty database is connected");
  } finally {
    // await client.close();
  }
};
server().catch(console.dir);

// getting server
app.get("/", (req, res) => {
  console.log("eProperty's Server is running on", port);
  res.send("Welcome to eProperty server!");
});

// running server on port
app.listen(port, () => {
  console.log(`eProperty is running on http://localhost:${port}/`);
});
