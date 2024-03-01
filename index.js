const express = require("express");
const cors = require("cors");
const { connect } = require("mongoose");

const userRoutes = require("./routes/userRoutes")
const {notFound,errorHandler} = require('./middleware/errormiddleware')

require("dotenv").config();

const app = express();

app.use(cors({ credentials: true, origin: "https://itsajith.netlify.app" }));

app.use(express.json({extended:true}))
app.use(express.urlencoded({extended:true}))

app.use('/ballot',userRoutes)

app.use(notFound)
app.use(errorHandler)

connect(process.env.MONGO_URI)
.then(
  app.listen(5000, () => console.log(`server connected on port ${process.env.PORT}`))
).catch(error => console.log(error))
