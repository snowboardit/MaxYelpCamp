// IMPORTS
const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/WrapAsync');
const ExpressError = require("../utils/ExpressError");
const Campground = require('../models/campgrounds');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas');


// FUNCTIONS
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


/**
 * ROUTES
 */

// POST - Campgrounds review
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Successfully created a review")
    res.redirect(`/campgrounds/${campground._id}`);

    // res.send(`Reviews: ${req.body.review['body']} ${req.body.review['rating']}`);
}));

// DELETE - Campgrounds review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    console.log(id, reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted a review")
    res.redirect(`/campgrounds/${id}`);

}));

module.exports = router;