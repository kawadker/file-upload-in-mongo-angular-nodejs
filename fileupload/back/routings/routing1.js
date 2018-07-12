const  exp = require('express');
const logger = require('morgan');
const busboyBodyParser = require('busboy-body-parser');

var app = exp();
const router = require('express').Router();
// const config = require('../config/config');
const mongoose = require("mongoose");
const fs = require('fs');

let Grid = require("gridfs-stream");
// let conn = mongoose.connection;
Grid.mongo = mongoose.mongo;
let gfs;

//<-----**CONNECT TO MONGODB SERVER**---->\\
mongoose.connect('mongodb://localhost:27017/files')

mongoose.connection.on('connect', () => {
    console.log('mongodb connected with localhost:27017/files');
});

mongoose.connection.on('error', (error) => {
    console.log('mongodb server is not connected with localhost:27017/files' + error);
});

app.use(logger('dev'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(busboyBodyParser({ limit: '10mb' }));  



mongoose.connection.on('connect', () => {
    
    gfs = Grid(mongoose.connection('mongodb://localhost:27017/files'));
    router.get('/', (req, res) => {
        res.send('Hello Housem !');
    });
    router.get('/img/:imgname', (req, res) => {
        let imgname = req.params.imgname;
        gfs.files.find({
            filename: imgname
        }).toArray((err, files) => {
            if (files.length === 0) {
                return res.status(404).send({
                    message: 'File not found'
                });
            }
            let data = [];
            let readstream = gfs.createReadStream({
                filename: files[0].filename
            });

            readstream.on('data', (chunk) => {
                data.push(chunk);
            });

            readstream.on('end', () => {
                data = Buffer.concat(data);
                let img = 'data:image/png;base64,' + Buffer(data).toString('base64');
                res.end(img);
            });

            readstream.on('error', (err) => {
                // if theres an error, respond with a status of 500
                // responds should be sent, otherwise the users will be kept waiting
                // until Connection Time out
                res.status(500).send(err);
                console.log('An error occurred!', err);
            });
        });
    });
    router.post('/img', (req, res) => {
        let part = req.files.file;
        let writeStream = gfs.createWriteStream({
            filename: 'img_' + part.name,
            mode: 'w',
            content_type: part.mimetype
        });

        writeStream.on('close', (file) => {
            // checking for file
            if (!file) {
                res.status(400).send('No file received');
            }
            return res.status(200).send({
                message: 'Success',
                file: file
            });
        });
        // using callbacks is important !
        // writeStream should end the operation once all data is written to the DB 
        writeStream.write(part.data, () => {
            writeStream.end();
        });
    });
});


// module.exports = router;

const port =3500;

app.listen(port, (err) => {
    if (err) {
        console.log("sever is not started.....")
    }
    console.log("Listening ..with port " + port);
  });