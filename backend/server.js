require('dotenv').config()
const express = require("express")
const app = express()
const path = require('path')
const {logger} = require('./middleware/logger')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const {logEvents} = require('./middleware/logger')
const productRoute = require("./router/product");
const storeRoute = require("./router/store");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const User = require("./models/users");
const Product = require("./models/product");
const PORT = process.env.PORT || 3500;

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

// app.unsubscribe(cookieParser())


app.use("/api/store", storeRoute);

// Products API
app.use("/api/product", productRoute);

// Purchase API
app.use("/api/purchase", purchaseRoute);

// Sales API
app.use("/api/sales", salesRoute);

// ------------- Signin --------------
let userAuthCheck;
app.post("/api/login", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    console.log("USER: ", user);
    if (user) {
      userAuthCheck = user;
      res.send(user);
    } else {
      userAuthCheck = null;
      res.status(401).send("Invalid Credentials");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);  // It's good practice to send a 500 status on server errors.
  }
});

// Getting User Details of login user
app.get("/api/login", (req, res) => {
  res.send(userAuthCheck);
});
// ------------------------------------

// Registration API
app.post("/api/register", (req, res) => {
  let registerUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
  });

  registerUser
    .save()
    .then((result) => {
      res.status(200).send(result);
      alert("Signup Successfull");
    })
    .catch((err) => console.log("Signup: ", err));
  console.log("request: ", req.body);
});




mongoose.connection.once('open',()=>{
    app.listen(PORT, () => {
        console.log("DB connected")
        console.log(`Server running on port ${PORT}`)

    })
});

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

