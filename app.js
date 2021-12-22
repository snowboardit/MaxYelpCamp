const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Campground = require("./models/campgrounds");
const Review = require("./models/review");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require('./schemas')
const catchAsync = require("./utils/WrapAsync");
const ExpressError = require("./utils/ExpressError");

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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

// Define Express app
const app = express();

/*
 * MIDDLEWARES
 */

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

/*
 * FUNCTIONS
 */
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    console.log(error);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

/*
 * ROUTES
 */

// Get - Home page
app.get('/', (req, res) => {
    res.render("home");
});

// GET - Test route
app.get('/makecampground', async (req, res) => {
    const camp = new Campground({ title: "My backyard", description: "Cheap camping!!" });
    camp.save();
    res.send(camp);
});

// GET - Campgrounds index
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// POST - New campground
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`);
}))

// GET - Create new campground
app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new');
});

// GET - Campground details
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
});

// GET - Edit campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

// PUT - Update campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${id}`);
}));

// DELETE - Purge campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// POST - Campgrounds review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

    // res.send(`Reviews: ${req.body.review['body']} ${req.body.review['rating']}`);
}));

// DELETE - Campgrounds review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    console.log(id, reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);

}));


/**
 * ERROR HANDLING
 */
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found.', 404));
})

/**
*** Custom Middleware
**/
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('error', { err });
});

/**
 * 
 */
app.listen(3000, () => {
    console.log("App is running!");
})