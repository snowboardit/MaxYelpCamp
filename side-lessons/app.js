const express = require('express');
const app = express();
const shelterRoutes = require('./routes/shelters');
const dogRoutes = require('./routes/dogs');
const router = require('./routes/shelters');
const cookieParser = require("cookie-parser");

app.use("/shelters", shelterRoutes);
app.use("/dogs", dogRoutes);

app.use((req, res, next) => {
    if (req.params.isAdmin) {
        next();
    }
    res.send("You are not authorized to view this page");
});

app.get("/admin", (req, res) => {
    res.send("Welcome to the admin page");
});

app.get("supersecretpage", (req, res) => {
    res.send("Welcome to the super secret page")
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

