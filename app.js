const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Campground = require("./models/campgrounds");
const methodOverride = require("method-override");

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// Routes
/*
** Get - home
 */
app.get('/', (req, res) => {
    res.render("home");
});

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({title: "My backyard", description:"Cheap camping!!"});
    camp.save();
    res.send(camp);
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
});

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();

    res.redirect('/campgrounds')
})

app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new');
});

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${id}`);
}); 

app.listen(3000, () => {
    console.log("App is running!");
})