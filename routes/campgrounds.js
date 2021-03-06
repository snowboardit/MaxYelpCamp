// IMPORTS
const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/WrapAsync');
const ExpressError = require("../utils/ExpressError");
const Campground = require('../models/campgrounds');
const { campgroundSchema } = require('../schemas');



// FUNCTIONS
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};


/**
 * ROUTES
 */

// GET - Campgrounds index
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// POST - New campground
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Campground created successfully!');
    res.redirect(`campgrounds/${campground._id}`);
}))

// GET - Create new campground
router.get('/new', (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/new');
});

// GET - Campground details
router.get('/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
});

// GET - Edit campground
router.get('/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
});

// PUT - Update campground
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
}));

// DELETE - Purge campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted review');
    res.redirect('/campgrounds');
}));

module.exports = router;