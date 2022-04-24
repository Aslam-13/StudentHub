 const express = require('express');
 const app = express();
 const path = require('path');
  const Article = require('./models/blogswritten');
 const session = require('express-session');
  const flash = require('express-flash');
const mongoose = require('mongoose');  
const cookieParser = require('cookie-parser');
 const PORT = process.env.PORT || 3000;
 const dotenv = require("dotenv");  
 dotenv.config();
 const url = process.env.MONGO;
 
 app.set('view engine', 'ejs');

 
 
 mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true});
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
 
 
 
  app.get('/', (req, res) => {
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
 
  
   app.listen(PORT);
