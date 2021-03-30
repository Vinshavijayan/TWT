const express =  require('express');
const  Mongoose= require('mongoose');
var router = express.Router();
const User = Mongoose.model('User');
const bcrypt = require('bcrypt');
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const multer = require('multer');


router.get('/', (req, res) => {
    res.render("user/addOrEdit", {
        viewTitle: "Insert User"
    });
});

router.post('/',async(req,res) =>{
    
        var user = new User();
        user.Name = req.body.Name;
        user.Address = req.body.Address;
        user.Age = req.body.Age;
        user.Username = req.body.Username;
        user.Password = req.body.Password;
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        user.Password = await bcrypt.hash(user.Password, salt);
        user.save((err,doc)=>{
            if(!err){
                res.redirect('user/list');
            }else{
                if(err.name=='ValidationError'){
                handleValidationError(err,req.body)
                res.render('user/addOrEdit',{
                    viewTitle:'Insert User',
                    user: req.body
                });
                }
                else
                console.log('error during data insertion :'+err)
            }
        });
        })


router.get('/list',(req,res)=>{
   User.find((err,docs) =>{
       if(!err){
          
     res.render('user/list',{
         list:docs
     });
       }else{
           console.log('error in retrieving user list:'+err);
       }
   });
});

function handleValidationError(err,body){
    for(field in err.errors){
        switch(err.errors[field].path){
            case 'Name': 
            body['NameError']=err.errors[field].message;
            break;
            case 'Address': 
            body['AddressError']=err.errors[field].message;
            break;
            case 'Age': 
            body['AgeError']=err.errors[field].message;
            break;
            case 'Username': 
            body['UsernameError']=err.errors[field].message;
            break;
            case 'Password': 
            body['PasswordError']=err.errors[field].message;
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
    destination: (req, file, cb) => {
        cb(null, __basedir + '/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});

const upload = multer({storage: storage});
 
// -> Express Upload RestAPIs
router.post('/uploadsheet', upload.single("uploadsheet"), (req, res) =>{
    importExcelData2MongoDB(__basedir + '/uploads/' + req.body.filename);
    res.json({
        'msg': 'File uploaded/import successfully!', 'file': req.file
    });
});

// -> Import Excel File to MongoDB database
function importExcelData2MongoDB(filePath){
    // -> Read Excel File to Json Data
    const excelData = excelToJson({
        sourceFile: filePath,
        sheets:[{
            // Excel Sheet Name
            name: 'Users',
 
            // Header Row -> be skipped and will not be present at our result object.
            header:{
               rows: 1
            },
			
            // Mapping columns to keys
            columnToKey: {
                A: 'Name',
                B: 'Address',
                C: 'Age',
                D: 'Username'
            }
        }]
    });

    // Insert Json-Object to MongoDB
   
        User.insertMany(excelData.Users, (err, res) => {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
        
        });
    
			
    fs.unlinkSync(filePath);

    }

    router.get('/upload',(req,res)=>{
        res.render('user/upload');
    })
module.exports = router;

