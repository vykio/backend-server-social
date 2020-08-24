const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcryptjs");

const router = express.Router();

const db = require("../database/connection");
const { object } = require("joi");
const users = db.get('users');
//users.index('username');
users.createIndex('username' , { unique: true });


const schema = Joi.object().keys({
    username: Joi.string().regex(/(^[a-zA-Z0-9_]*$)/).min(2).max(30).required(),
    password: Joi.string().trim().min(6).required()
});



router.get('/', (req, res) => {
    res.json({
        message: 'Auth'
    });
});

// POST /auth/signup
router.post('/signup', (req, res, next) => {

    console.log("body", req.body);

    const result = schema.validate(req.body);

    console.log("result", result);

    if (result.error == null) {
        console.log("--> null function");
        //make sure username is unique
        users.findOne({
            username: req.body.username
        }).then(user => {
            console.log("--> then function");
            // if user is undefined, username is not in the db, otherwise, duplicate user detected
            if (user) {
                console.log("--> user exists function");
                //user already exists
                //res.status(409);
                const error = new Error("Taken !");
                res.status(409);
                next(error);
            } else {
                console.log("--> user doesnt exists function");
                // hash the password
                // insert user into db
                bcrypt.hash(req.body.password.trim(), 12)
                    .then(hashedPassword => {
                        const newUser = {
                            username: req.body.username,
                            password: hashedPassword
                        }

                        users.insert(newUser).then(insertedUser => {
                            //delete insertedUser.password;
                            res.json({
                                _id : insertedUser._id,
                                username : insertedUser.username
                            });
                        });
                    });

                
                
            }
            
        });
    } else {
        console.log("--> else function");
        res.status(422);
        next(result.error);
    }

    //res.json(result);
});

module.exports = router;