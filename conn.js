const express = require('express');
const bodyParser= require('body-parser');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const validator = require('email-validator');

mongoose.Promise = global.Promise;
const accountSchema = new mongoose.Schema({
	name: 'string',	
	email: 'string',
	username: 'string',
	password: 'string'
});
const uri = "mongodb://admin:admin123@ds115131.mlab.com:15131/students";

const options = {
	useMongoClient: true,
	promiseLibrary: require('bluebird'),
};
const db = mongoose.createConnection(uri, options);
const Accounts = db.model('accounts', accountSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req,res)=>{
	const callback = (err,result) => {
		if(err)throw err;
		res.render('login.ejs', {accounts: result});		
	};
	Accounts.find(callback);
});


app.post('/login',(req,res)=> {
	var username = req.body.username;
	var password = req.body.password;

	Accounts.findOne({username: username, password: password},(err,user)=>{
		if(err){
			console.log(err);
			return res.status(500);
		}
		
		if(username == "" || password == ""){
			return res.redirect('/fieldLogin');
		}

		if(!user){
			console.log("Invalid Username or Password");
			return res.redirect('/tryagain');
		}
		  
		return res.redirect('/users_page');
	});
});

app.get('/tryagain',(req,res)=>{
	res.render('error_login.ejs');
});

app.post('/accounts', (req, res) => {
	const newAccount = {
		"name": req.body.name,
		"email": req.body.email,
		"username": req.body.username,
		"password": req.body.password
	};
	const callback = (err, data)=>{
		if(err)throw err;
		console.log('saved to database');
		res.redirect('/users_page');
	};

	var val = validator.validate(req.body.email);
		
		if(req.body.name == "" || req.body.email == "" || req.body.username == "" || req.body.password == "" || req.body.confirm == ""){
			res.redirect('/fieldsRegister');
		}

		else if(val == false){
			res.redirect('/emailRegister');
		}

		else if(req.body.password != req.body.confirm){
			res.redirect('/registerError');
		}

		else{
			Accounts.findOne({username: req.body.username,email: req.body.email},(err,user)=>{
				if(err){
					console.log("Status 500");
					return res.status(500);
				}

				if(user){
					console.log("Username or Email Address already existed");
					return res.redirect('/registerExists');
				}
				console.log(req.body.email);	
				Accounts.create(newAccount, callback);
			
			});
		}
});


app.get('/register',(req,res)=>	{
	res.render('register.ejs');
});

app.get('/registerError',(req,res)=>{
	res.render('error_register.ejs');
});

app.get('/registerExists',(req,res)=>{
	res.render('existed_register.ejs');
});

app.get('/emailRegister',(req,res)=>{
	res.render('email_register.ejs');
});

app.get('/fieldsRegister',(req,res)=>{
	res.render('fields_register.ejs');
});

app.get('/fieldLogin',(req,res)=>{
	res.render('field_login.ejs');
});

app.get('/users_page',(req,res)=>{
	console.log(req);
	const callback = (err,result) => {
		if(err)throw err;
		res.render('users_page.ejs', {accounts: result});		
	};
	Accounts.find(callback);
})


app.set('port',(process.env.PORT || 3000));
app.listen(app.get('port'),()=>{
	console.log('listening on ', app.get('port'));
});
