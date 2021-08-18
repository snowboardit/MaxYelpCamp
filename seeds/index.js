const mongoose = require("mongoose");
const Campground = require("../models/campgrounds");
const cities = require("./cities");
const {descriptors, places} = require("./seedHelpers");

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = (async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor((Math.random() * 50) + 10);
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: `https://source.unsplash.com/collection/483251`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod asperiores consequuntur ducimus voluptatum sequi minima maiores, distinctio facilis odit quam facere laborum necessitatibus eveniet nobis quos commodi? Cum, sit ut.',
            price: randomPrice
        });
        await camp.save();
    }
    
});

seedDB().then(() => {
    mongoose.connection.close();
});