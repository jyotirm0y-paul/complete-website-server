const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x2r2l.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(express.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
  res.send("hello its working")
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("interiorDesign").collection("services");
  const reviewCollection = client.db("interiorDesign").collection("reviews");
  const adminCollection = client.db("interiorDesign").collection("admins");
  const ordersCollection = client.db("interiorDesign").collection("orders");


  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const sName = req.body.sName;
    const price = req.body.price;
    console.log(sName, price, file);
   

      const newImg = file.data;
const encImg = newImg.toString('base64');

var image = {
contentType: file.mimetype,
size: file.size,
img: Buffer.from(encImg, 'base64')
}
serviceCollection.insertOne({sName, price, image})
      .then(result => {
          res.send(result.insertedCount > 0)
        
        
      })
  });

  app.get('/services', (req, res) => {
    serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
});


app.delete('/delete/:id', (req, res) =>{
  serviceCollection.deleteOne({_id: ObjectId(req.params.id)})
  .then(result =>{
    console.log(result);
    res.send(result.deletedCount > 0);
  })

})


app.post("/addReview", (req, res) => {
  const name = req.body.name;
  const review = req.body.review;
  const photo = req.body.photo;
  console.log(name, review, photo);

  reviewCollection.insertOne({name, review, photo})
    .then(result => {
        
          console.log(result)
        
        res.send(result.insertedCount > 0)
      })
      
    })


app.get('/reviews', (req, res) => {
  reviewCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
});


app.post("/addAdmin", (req, res) => {
  const email = req.body.email;

  adminCollection.insertOne({email})
    .then(result => {
          console.log(result)
        res.send(result.insertedCount > 0)
      })
      
    })


    app.get('/admins', (req, res) => {
      adminCollection.find({})
          .toArray((err, documents) => {
              res.send(documents);
          })
    });


    app.post("/isAdmin", (req, res) => {
      const email = req.body.email;
      adminCollection.find({email: email})
      .toArray((err, admins) => {
res.send(admins.length > 0);
  

      })
  
  
  
    });


    app.post('/addOrder', (req, res) => {
      const order = req.body;
      ordersCollection.insertOne(order)
          .then(result => {
            res.send(result.insertedCount > 0)
          })
        })


        app.get('/orders', (req, res) => {
          console.log(req.query.email);
          ordersCollection.find({email:req.query.email})
              .toArray((err, documents) => {
                  res.send(documents);
                  console.log(documents);
              })
        });


        app.get('/allOrders', (req, res) => {
          ordersCollection.find({})
              .toArray((err, documents) => {
                  res.send(documents);
                  console.log(documents);
              })
        });



        


});


app.listen(process.env.PORT || port)
