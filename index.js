 const express = require('express');
 const app = express();
 const path = require('path');
 const User = require('./models/users');
 const Article = require('./models/blogswritten');
 const session = require('express-session');
  const bcrypt = require('bcrypt'); 
 const passport = require('passport');
 const passportlocal = require('passport-local');
 const flash = require('express-flash');
const mongoose = require('mongoose');  
const cookieParser = require('cookie-parser');
 const PORT = process.env.PORT || 3000;
 
 app.set('view engine', 'ejs');
 
 
 mongoose.connect("mongodb://localhost:27017/studenthub", {useNewUrlParser:true, useUnifiedTopology:true});
 app.set("views", path.resolve(__dirname, "views"));
 app.use(cookieParser('secret'));
 app.use(session({
   secret: 'keyboard cat',
   resave: false,
   saveUninitialized: false,
   cookie: {maxAge: 60000}
  }));
  
  app.use((req, res, next)=>{
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();  
  })
  app.use(flash());
  app.use(express.static("public"));
  app.use(express.urlencoded({extended: false}));
  function guest(req, res, next){
    if(!req.isAuthenticated()){
      return next()
    }
    return res.redirect('/');
  }
 
  app.use(passport.initialize());
  app.use(passport.session());
  const passportinit = require('./config/passport');
  passportinit(passport);
   app.get('/', (req, res) =>{
   res.render('index');
  })
  app.get('/guidance', (req, res)=>{
    res.render('guidance');

   
  })
  app.get('/resources', (req, res)=>{
    res.render('resources');
  })
 app.get('/notes', (req, res) =>{
   res.render('notes');
 })
 app.get('/write', (req, res)=>{
   res.render('write');
  })
   app.get('/blogs', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    res.render('blogs', { articles: articles })
  }) 
  
  app.get('/blogs/:id', async(req, res) =>{
const article =   await Article.findById(req.params.id);
res.render('show', {article: article});
 })
   
  
 app.get('/users/login', guest, (req, res) =>{
    res.render('users/login');
 })
 app.get('/users/register', guest, (req, res) =>{
    res.render('users/register');
 })
 app.post('/write', async(req, res)=>{
   let article = new Article({ 
     title: req.body.title,
     description: req.body.description,
     markdown:  req.body.markdown
    });
    try{
      article = await article.save();
      res.redirect('/blogs' );
       }
    catch(e)
    {
      res.redirect('/write');
     }

 })
 app.post('/users/register', async (req, res)  =>{
    const {name, email, password} = req.body;
    if(!name||!email||!password)
    {
      req.flash('error', 'All fields are required');
      res.redirect('/users/register');

    }
    if(User.exists({email:email}, (err, result) => {
      if(result)
      {
        req.flash('error', 'Email already exists');
        res.redirect('/users/register');
      }
    }));
    const hashedpassword = await  bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedpassword
    })
    user.save()
    .then((user)=>{
      res.redirect('/');

    }).catch(error =>{
      req.flash('error', 'something went wrong');
      res.redirect('/users/register');

  
    })
    console.log(req.body); 
  })
  app.post('/users/login', (req, res, next)=>{
    passport.authenticate('local', (err, user, info) =>{
      if(err)
      {
        req.flash('error', info.message );
        return next(err);
   
             } 
            if(!user)
            {
              req.flash('error', info.message);
              res.redirect('/users/login');
            }
            req.logIn(user, (err) => {
              if(err)
              {
                req.flash('error', info.message);
                return next(err);
                }
                  return res.redirect('/');
            })
 
   
 
     })(req, res, next);
  })
 
  
   app.listen(PORT);
