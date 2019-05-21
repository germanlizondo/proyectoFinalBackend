const express = require('express');
const path = require('path');
const multer = require('multer');
const uuid = require('uuid/v4');
const morgan = require('morgan');
const port = process.env.PORT || 3001;
const bodyParser = require('body-parser'); 
        

const Chat = require('./models/Chat');

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
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
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

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//routes
app.use(require('./routes/index.routes'));

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//listening
const server = app.listen(port, () => console.log(`listening on port ${port}`));


//socketIO settings
const socketIO = require('socket.io');
const io = socketIO.listen(server);

//sockets
io.on('connection', function(socket) {
    console.log('Un cliente se ha conectado');
   
      socket.on('join-room', (room)=>{
          socket.join(room);
      });
      socket.on('join-geolocation', (room)=>{
          console.log(room)
        socket.join(room);
    });
    socket.on('leave-geolocation', (room)=>{
        console.log(room)
        socket.leave(room);
    });
      socket.on('leave-room', (room)=>{
        socket.leave(room);
    });

      socket.on('new-mensaje', (data)=>{
        const data_string = JSON.stringify(data).replace(/_/g,"");
        
        let dataJson = JSON.parse(data_string);
        let message = dataJson.message;
        let date = new Date(message.date);
        message.date = date.toISOString();
          const room = dataJson.room;
                      
          Chat.updateOne({ _id: room }, {
            $push: {
                mensajes: {
                    content: message.content,
                    author: message.author.id
                }
            }
        })
        .then( socket.to(room).emit("new-message",message))
        .catch((err)=>{
            console.log(err);
            socket.to(room).emit("new-message","Error al enviar Mensaje")
        })
       
    });

    socket.on('geolocation',(data)=>{

        console.log(data);
        const room = data.room;

        socket.to(room).emit('geolocation-send',{
            "latitude": data.latitude,
            "longitud": data.longitud
        })
    })

    

});
