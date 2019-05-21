const { Router } = require('express');
const router = Router();
const mongoose = require('mongoose');

const path = require('path');
const generateRSAKeypair = require('generate-rsa-keypair');
const fs = require('fs');

const User = require('../models/User');
const Chat = require('../models/Chat');
const Following = require('../models/Following');
const Followed = require('../models/Followed');


const images_dir = path.join(__dirname + '/../public/images');

//routes
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../index.html'));
});

//users
router.get('/all-users', async(req, res) => {

    User.find({}, { password: 0 })
        .populate('followers')
        .then((users) => res.send({ users: users }))
        .catch((err) => res.send(err));

});

router.get('/get-user/:id', async(req, res) => {

    User.findOne({ _id: req.params.id }, { password: 0,publicKey: 0,privateKey:0 })
        .then((user) => res.send({ user: user }))
        .catch((err) => res.send(err));

});

router.get('/all-users/:nickname', async(req, res) => {

    var regexp = new RegExp("^" + req.params.nickname);
    User.find({ nickname: regexp }, { password: 0 })
        .then((users) => res.send({ users: users }))
        .catch((err) => res.send(err));

});

router.post('/login', async(req, res) => {
    console.log(req.body.password)
    User.findOne({ nickname: req.body.nickname, password: req.body.password })
        .then((user) => {
            
            if (!user) res.send({ err: 'Email o contraseña invalidos' });
            else res.send(user);
        })
        .catch((err) => res.send({
            error: err
        }));
});

router.post('/new-user', async(req, res) => {

    const user = new User();
    const followed = new Followed();
    const following = new Following();


    user.nickname = req.body.nickname;
    user.email = req.body.email;
    user.password = req.body.password;
  
    console.log(user);
    user.save().then(() => {
            followed.user = user._id;
            return followed.save()
        })
        .then(() => {
            following.user = user._id;
            return following.save();
        })
        .then(() => res.send({ user: user }))
        .catch((err) => res.send(err));
});

router.post('/make-follow', async(req, res) => {
    Followed.updateOne({ user: req.body.user }, {
        $push: {
            followedby: req.body.userfollowing
        }
    })


    Following.updateOne({ user: req.body.userfollowing }, {
        $push: {
            isfollowing: req.body.user
        }
    })

    .then(res.send({ "status": "OK" }))
        .catch((err) => res.send(err))
});

//followings
router.get('/get-followings/:id', async(req, res) => {


    Following.findOne({ user: req.params.id }, { password: 0 })
        .populate('following')
        .populate('user')
        .then((followings) => res.send(followings))
        .catch((err) => res.send(err));

});
//followers
router.get('/get-followers/:id', async(req, res) => {


    Followed.findOne({ user: req.params.id }, { password: 0 })
        .populate('followed')
        .populate('user')
        .then((followers) => res.send(followers))
        .catch((err) => res.send(err));

});
//chats

router.get('/get-chat/:id', (req, res) => {

    var id = mongoose.Types.ObjectId(req.params.id);
    Chat.find({ usuarios: id }, { mensajes: 0 })
        .populate('usuarios')
        .then((chats) => {
            res.send({chats}
                )})
        .catch((err) => res.send(err))
});


router.post('/new-chat', async(req, res) => {

    const chat = new Chat();
    const transmitor = await User.findById({ _id: req.body.transmitor });
    const receptor = await User.findById({ _id: req.body.receptor });
    var pair = generateRSAKeypair()
    chat.publicKey  = pair.public;
    chat.privateKey = pair.private;
    chat.usuarios = [transmitor, receptor];
    chat.save()
        .then(res.send(chat))
        .catch((err) => res.send(err));

});


//messajes
router.get('/get-message/:id', (req, res) => {
const id = req.params.id;
   
    Chat.findOne({_id:id})
    .populate('mensajes.author')
    .then((chats) => res.send({chats}))
    .catch((err) => res.send(err))
});

router.post('/new-message', (req, res) => {

    Chat.updateOne({ _id: req.body.id }, {
            $push: {
                mensajes: {
                    content: req.body.content,
                    author: req.body.author
                }
            }
        })
        .then(res.send("message create"))
        .catch((err) => res.send(err))
});


//images
router.post('/uploadprofileimage', (req, res) => {
    console.log("Aaaaaaaaaaa");
   
});

router.get('/getimages',(req,res)=>{

    var allfiles = [];
    fs.readdir(images_dir,(err,files)=>{
        files.forEach(function (file) {
            // Do whatever you want to do with the file
           allfiles.push({'file':file});
    });
    res.send(JSON.stringify(allfiles));
    })
   
})

router.post('/cambia-img',(req,res)=>{
    console.log(req.body)
    User.updateOne({ _id: req.body.user }, {
        $set: { img: req.body.img }
    }).then(data=>res.send(data))
})

router.get('/get-key/:id',(req,res)=>{

    Chat.findOne({ _id: req.params.id },{publicKey:1,privateKey:1})
    .then((chat) => res.send({ chat }))
    .catch((err) => res.send(err));
})

module.exports = router;