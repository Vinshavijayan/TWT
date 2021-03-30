require('./models/db');

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
let bodyParser = require('body-parser');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const bcrypt = require('bcrypt');


const userController = require('./controllers/userController');

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout' ,handlebars: allowInsecurePrototypeAccess(Handlebars), layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');

    
app.listen(3000,()=>{
    console.log('Express server started at port : 3000');
});

app.use('/user',userController);