const express = require("express");
const cors = require("cors");
const db = require("./database/connection");
const morgan = require("morgan");
const Filter = require("bad-words");
const rateLimit = require("express-rate-limit");

const app = express();

const posts = db.get('posts');
const auth = require('./auth');

const filter = new Filter();

app.use(cors());

app.use(morgan('dev'));


app.use(express.json());





app.get('/', (req, res) => {
    res.json({
        message: 'Hello, World!'
    })
})

app.get('/post', (req,res) => {
    posts
        .find()
        .then(postsRetreived => {
            res.json(postsRetreived);
        })
})

app.use('/auth', auth);

function isValidPost(post) {
    // You can use Express Validator, or Joi, or Yup (npm packages)
    return post.name && post.name.toString().trim() !== '' &&
    post.content && post.content.toString().trim() !== '';
}

// Limit les posts à 1 toutes les 30 secondes 
// Pour limiter les post et get => bouger le app.use du dessous tout en haut
app.use(rateLimit({
    windowMs: 5*1000, // 30 secondes
    max: 1 //limit each ip to 1 request per windowMs
}));

app.post('/post', (req, res) => {
    if (isValidPost(req.body)) {
        //insert into db
        const post = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        }
        posts
            .insert(post)
            .then(createdPost => {
                res.json(createdPost);
            })
    } else {
        res.status(422);
        res.json({
            message: 'Hey! Name and Content are required !'
        })
    }
})


function notFound(req, res, next) {
    res.status(404);
    const error = new Error('Not Found - ' + req.originalUrl);
    next(error);
}
  
function errorHandler(err, req, res, next) {
    res.status(res.statusCode || 500);
    res.json({
        message: err.message,
        stack: err.stack
    });
}

app.use(notFound);
app.use(errorHandler);

app.listen(5000, () => {
    console.log("Listening on http://localhost:5000/");
})