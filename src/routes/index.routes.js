const { Router } = require('express');
const router = Router();
const mongoose = require('mongoose');

const path = require('path');

const User = require('../models/User');
const Chat = require('../models/Chat');



//routes
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../index.html'));
});

//users
router.get('/users', async(req, res) => {
    const users = await User.find();
    res.send(users);
});

router.post('/login', async(req, res) => {

    User.findOne({ email: req.body.email, password: req.body.password })
        .then((user) => {
            if (!user) res.send({ err: 'Email o contraseña invalidos' });
            else res.send(user);
        })
        .catch((err) => res.send({
            error: err
        }));
});

router.post('/newuser', async(req, res) => {
    const user = new User();
    user.nickname = req.body.nickname;
    user.email = req.body.email;
    user.password = req.body.password;
    console.log(user);


    user.save().then(() => {
            res.send(user);
        })
        .catch((err) => res.send(err));
});

//chats

router.get('/chats', (req, res) => {
    Chat.find({})
        .then((chats) => res.send(chats))
        .catch((err) => res.send(err))

});

router.post('/newchat', (req, res) => {

    const chat = new Chat();
    var transmitor;
    var receptor;


    User.findOne({ nickname: req.body.transmitor })
        .then((user) => {

            transmitor = mongoose.Types.ObjectId(user._id);
            console.log("gr" + transmitor);
            return User.findOne({ nickname: req.body.receptor })
        })
        .then((user) => {
            receptor = mongoose.Types.ObjectId(user._id);
            chat.usuarios = [transmitor, receptor];

            return chat.save();
        })
        .then(() => res.send(chat))
        .catch((err) => res.send(err));


});



//images
router.post('/uploadprofileimage', (req, res) => {
    console.log(req.file);
    console.log("ha recivido algo");
    res.send("updolades");
});

module.exports = router;