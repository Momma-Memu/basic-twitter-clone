const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const { asyncHandler, handleValidationErrors } = require("../utils");
const { requireAuth } = require("../auth");

const db = require("../db/models");
const{ Tweet, User} = db;

router.use(requireAuth);

const tweetValidator = [
    check('message')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a tweet')
        .isLength({ max: 280 })
        .withMessage('Input must be between 0 and 280 characters long')
]



function tweetNotFoundError(id){
    const err = Error(`Tweet with ID: ${id}, was not found`)
    err.status = 404;
    err.title = 'Tweet not found';
    return err;
}

router.get("/", asyncHandler(async (req, res) => {
    const tweets = await Tweet.findAll({
        include: [{ model: User, as: "user", attributes: ["username"] }],
        order: [["createdAt", "DESC"]],
        attributes: ["message"],
      });
    res.json({ tweets });
}));

router.get('/:id(\\d+)', asyncHandler(async (req, res, next) => {
    const tweetId = parseInt(req.params.id, 10)
    const tweet = await Tweet.findByPk(tweetId);
    if(!tweet){
        const error = tweetNotFoundError(tweetId)
        next(error);
        return;
    }
    res.json({tweet})
}));


router.post("/", tweetValidator, handleValidationErrors, asyncHandler(async (req, res) => {
    console.log('hey')
    const tweet = await Tweet.create({ message: req.body.message, userId: req.body.userId });
    res.redirect('/')
}));

router.put("/:id(\\d+)", tweetValidator, handleValidationErrors, asyncHandler(async (req, res) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);
    if(!tweet){
        const error = tweetNotFoundError(tweetId)
        next(error);
        return;
    }else{
        await tweet.update({ message: req.body.message })
        res.json({ tweet });
        return;
    }
}))

router.delete("/:id(\\d+)", asyncHandler(async (req, res) => {
    const tweetId = parseInt(req.params.id, 10);
    const tweet = await Tweet.findByPk(tweetId);
    if(!tweet){
        const error = tweetNotFoundError(tweetId)
        next(error);
        return;
    }
    await tweet.destroy();
    res.json({ tweet })
}));



module.exports = {
    router
}