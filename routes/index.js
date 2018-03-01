var express = require('express');
var router = express.Router();
var User = require('../models/user');



import serverRender from '../serverRender';

router.get("/",(req,res)=>{
	res.render('main', { 
				js:['js/libs.js','https://api-maps.yandex.ru/2.1/?lang=ru_RU'], 
				css:['_main.min.css','owl.carousel_min.css']
				})
})

router.get('/deliver',(req,res, next)=>{
	serverRender()
		.then(content =>{
			res.render('deliver',{
				content: content,
				js: ['js/react.js'],
				css: ['_deliver.min.css']
			})
		})
		.catch(console.error)
})

router.get('/profile', (req,res,next)=>{
	if(!req.session.userId){
		var err = new Error("Вы не аторизован!")
		err.status = 403;
		err.name = 'login';
		return next(err);
	}
	User.findById(req.session.userId)
		.exec(function(error,user){
			if(error){
				return next(error);
			}else{
				return res.render('profile',{
											title: "Личный кабинет",
											css: ['_main.min.css'],
											name: user.name,
											order: user.order,
											email: user.email})
			}
		})
})


// LOGIN

//GET
router.get('/login', (req,res,next)=>{
	res.render('login',{
		css:['_main.min.css']
	})
})

//POST
router.post('/login', (req,res,next)=>{
	if(req.body.email && req.body.password){
		User.authentication(req.body.email, req.body.password, function(err, user){
			if(err || !user){
				var err = new Error("Неверный пароль или почта!")
				err.status = 401;
				err.name = 'login';
				return next(err)
			}else{
				req.session.userId = user._id; // Указываем сессию по ID из DB
				return res.redirect('/profile');
			}
		})
	}else{
		var err = new Error("Заполните все поля!");
		err.status = 400;
		err.name = 'login'
		return next(err);
	}
})

//LogOUT

//GET
router.get('/logout', function(req, res, next){
	if(req.session){
		req.session.destroy(function(err){
			if(err){
				return next(err);
			}else{
				return res.redirect('/')
			}
		})
	}
})

// REGISTRATION

//GET
router.get('/registration', (req,res,next)=>{
	res.render('registration',{
		css:['_main.min.css']
	})
})

//POST
router.post('/registration', (req,res,next)=>{
	if(req.body.name && req.body.email && req.body.password && req.body.confirmPassword){
		if(req.body.password !== req.body.confirmPassword){
			var err = new Error("Пароль не совпадает");
			err.status = 400;
			return next(err);
		}

		var userData = {
			name: req.body.name,
			email: req.body.email,
			password: req.body.password
		}

		User.create(userData, function(error, user){
			if(error){
				return next(error)
			}else{
				req.session.userId = user._id; // Указываем сессию по ID из DB
				return res.redirect("/profile")
			}
		})

	}else{
		var err = new Error("Необходимо заполнить все поля!")
		err.status = 400;
		return next(err);
	}
})
// ORDER

//POST

router.post("/deliver",(req,res,next) =>{
	console.log(req.body)
})

module.exports = router;