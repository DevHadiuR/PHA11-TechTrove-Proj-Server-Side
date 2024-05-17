const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello this is from the assignment 11 Server side.");
});

// mongo Data base from here

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vuymtad.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // all blogs collection
    const allBlogsCollection = client.db("BlogsDB").collection("allBlogs");
    const allCommentsCollection = client
      .db("BlogsDB")
      .collection("allComments");
    const allWishlistCollection = client
      .db("BlogsDB")
      .collection("allWishlist");

    app.get("/allBlogs", async (req, res) => {
      const filter = req.query.category;
      const search = req.query.search;

      let query = {
        title: {
          $regex: search,
          $options: "i",
        },
      };

      if (filter) query.category = filter;

      const result = await allBlogsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/featuredBlogs", async (req, res) => {
      const topBlogs = await allBlogsCollection
        .find()
        .sort({ longDescription: -1 })
        .limit(10)
        .project({ title: 1, bloggerEmail: 1, bloggerProfile: 1 })
        .toArray();
      res.send(topBlogs);
    });

    app.get("/allBlogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allBlogsCollection.findOne(query);
      res.send(result);
    });

    app.post("/allBlogs", async (req, res) => {
      const blogs = req.body;
      const result = await allBlogsCollection.insertOne(blogs);
      res.send(result);
    });

    app.put("/allBlogs/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBlog = {
        $set: {
          ...body,
        },
      };
      const result = await allBlogsCollection.updateOne(
        query,
        updatedBlog,
        options
      );
      res.send(result);
    });

    // all comment
    app.post("/allComments", async (req, res) => {
      const comment = req.body;
      const result = await allCommentsCollection.insertOne(comment);
      res.send(result);
    });

    app.get("/allComments", async (req, res) => {
      const result = await allCommentsCollection.find().toArray();
      res.send(result);
    });

    app.get("/allComments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { blogId: id };
      const result = await allCommentsCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/allComments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await allCommentsCollection.deleteOne(query);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("The server is running on the port :", port);
});
