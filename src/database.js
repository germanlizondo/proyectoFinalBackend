const mongoose = require('mongoose');
const server = 'localhost';
const database = 'proyectofinal';

mongoose.connect('mongodb://' + server + '/' + database, {
        useNewUrlParser: true
    })
    .then(db => console.log('Conected to MongoDB'))
    .catch(err => console.error(err));