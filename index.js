const express = require("express");
const path = require("path");
const { connectToMongoDB } = require("./connections");

const otp = require('./routes/otp')
const signUp = require("./routes/signUp");
const login = require("./routes/login");
const expense = require("./routes/expenseui");
const afterlogin = require("./routes/afterlogin");
const UI = require("./models/expenseui");
const cookieParser = require("cookie-parser");
const { restrictToLoggedinUserOnly, checkAuth} = require("./middlewares/foraccessingafterloginpage");
const app = express();
const homepage = require("./routes/homepage");

const port = 1002; 
connectToMongoDB("mongodb://localhost:27017/").then(() =>
  console.log("MongoDb connected")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./view"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/",signUp );
app.use("/auth",otp);

app.use("/user",login);
app.use("/user/expense",restrictToLoggedinUserOnly,checkAuth,expense);

app.use("/user/afterloginpage",restrictToLoggedinUserOnly,afterlogin);


app.use("/homepage",homepage);

app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const urlRoute = require("./routes/url");

const urlshortner = require("./routes/urlshortners");

const URL = require("./models/url");


app.use("/url", urlRoute);
app.use("/urlshortner", urlshortner);

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});


app.listen(port, () => console.log(`Server Started at PORT:${port}`));




