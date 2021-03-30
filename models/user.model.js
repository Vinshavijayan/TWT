const mongoose=require('mongoose');

var userSchema=new mongoose.Schema({
    Name: {
        type:String,
        required: 'This field is required..'
    },
    Address:{
       type:String,
       required: 'This field is required..' 
    },
    Age:{
        type:String,
        required: 'This field is required..'
    },
    Username:{
        type: String,
        required:'This field is required..'
    },
    Password:{
        type:String,
        required:'This field is required'
    }
});

mongoose.model('User',userSchema);