const express = require('express');
const path = require('path');
const multer = require('multer');
const uuid = require('uuid/v4');
const morgan = require('morgan');
const port = process.env.PORT || 3000;



//init
const app = express();
const conectionMongoDB = require('./database');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname + '/public/images'));
    },
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname).toLowerCase());
    }
})



//middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb("envia una imagen");
        }
    }
}).single('profileimage'));




//routes
app.use(require('./routes/index.routes'));

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//listening
app.listen(port, () => console.log(`listening on port ${port}`));