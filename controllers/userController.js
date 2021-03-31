const express = require('express');
const Mongoose = require('mongoose');
var router = express.Router();
const User = Mongoose.model('User');
const Excel = require('../models/excel')
const bcrypt = require('bcrypt');
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const multer = require('multer');
const XLSX = require('xlsx')

router.get('/', (req, res) => {
    res.render("user/addOrEdit", {
        viewTitle: "Insert User"
    });
});

router.post('/', async (req, res) => {

    var user = new User();
    user.Name = req.body.Name;
    user.Address = req.body.Address;
    user.Age = req.body.Age;
    user.Username = req.body.Username;
    user.Password = req.body.Password;
    const salt = await bcrypt.genSalt(10);
    // now we set user password to hashed password
    user.Password = await bcrypt.hash(user.Password, salt);
    user.save((err, doc) => {
        if (!err) {
            res.redirect('user/list');
        } else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body)
                res.render('user/addOrEdit', {
                    viewTitle: 'Insert User',
                    user: req.body
                });
            }
            else
                console.log('error during data insertion :' + err)
        }
    });
})


router.get('/list', (req, res) => {
    User.find((err, docs) => {
        if (!err) {

            res.render('user/list', {
                list: docs
            });
        } else {
            console.log('error in retrieving user list:' + err);
        }
    });
});

function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'Name':
                body['NameError'] = err.errors[field].message;
                break;
            case 'Address':
                body['AddressError'] = err.errors[field].message;
                break;
            case 'Age':
                body['AgeError'] = err.errors[field].message;
                break;
            case 'Username':
                body['UsernameError'] = err.errors[field].message;
                break;
            case 'Password':
                body['PasswordError'] = err.errors[field].message;
                break;
            default:
                break;


        }
    }
}

router.get('/delete/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/user/list');
        }
        else { console.log('Error in user delete :' + err); }
    });
});


global.__basedir = __dirname;

// -> Multer Upload Storage
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});

const upload = multer({ storage: storage }).fields([
    {
        name: 'file',
        maxCount: 1,
    },
]);

// -> Express Upload RestAPIs
router.post('/uploadsheet', upload, (req, res) => {
    try {
        if (req.files && req.files.file && req.files.file.length) {
            let file = XLSX.readFile(req.files.file[0].path);
            let sheet_name_list = file.SheetNames;
            let xlData = XLSX.utils.sheet_to_json(file.Sheets[sheet_name_list[0]]);
            Excel.insertMany(xlData, (err,docs) => {
                if (err) {
                    res.status(500).json({
                        success: false,
                        message: 'Database writing error'
                    })
                }
                res.send('sucessully inserted into the db');
            })

        } else {
            res.status(500).json({
                success: false,
                message: 'file upload error'
            })
        }

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: e.toString(),
        });
    }

});


router.get('/upload', (req, res) => {
    res.render('user/upload');
})
module.exports = router;

