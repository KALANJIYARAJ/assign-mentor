const express = require("express");
const app = express();
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const URL = "mongodb+srv://admin:admin123@cluster0.zfkqxf5.mongodb.net/?retryWrites=true&w=majority";
// "mongodb://localhost:27017/";


app.use(express.json());

//create_mentor
app.post("/mentor", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("mentor_assgining");
    const mentor = await db.collection("mentors").insertOne(req.body);
    await connection.close();
    res.json({ message: "mentor created" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

//create-student
app.post("/student", async (req, res) => {
  try {
    //connect the Database
    const connection = await mongoclient.connect(URL);

    //select the DB
    const db = connection.db("mentor_assgining");

    const student = await db.collection("students").insertOne(req.body);
    //close the connection
    await connection.close();
    res.json({ message: "student created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//Assign a student to Mentor
app.put("/students_assgin/:mId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("mentor_assgining");
    // req.body should be like this [5,6,7]
await db
      .collection("mentors")
      .updateOne(
        { _id: parseInt(req.params.mId) },
        { $push: { students_ids: { $each: req.body } } } );
    
    await connection.close();
    res.json({message:"students assgined sucessfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

//Assign or Change Mentor for particular Student
app.put("/mentor_assgin/:sId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("mentor_assgining");
 await db
      .collection("students")
      .updateOne(
        { _id: parseInt(req.params.sId) },
        { $set:req.body } );
    
    await connection.close();

    // res.json({ message: "students sucessfully assgined" });
    res.json({message:"mentor assgined sucessfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// show all students for a particular mentor
app.get("/mentor_students/:mId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("mentor_assgining");
    // req.body should be like this [5,6,7]

    const students_list = await db
      .collection("mentors")
      .aggregate([
        {
            '$match': {
               _id:parseInt(req.params.mId)
            }
        }, {
            '$lookup': {
                'from': 'students', 
                'localField': 'students_ids', 
                'foreignField': '_id', 
                'as': 'students_list'
            }
        }, {
            '$project': {
                'students_ids': 0
            }
        }
    ])
      .toArray();

    await connection.close();
    res.json(students_list);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(process.env.PORT || 3003);
