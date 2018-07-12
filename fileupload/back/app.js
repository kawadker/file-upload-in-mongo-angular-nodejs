const exp = require('express');
const app = exp();
const busboyBodyParser = require('busboy-body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors= require('cors');


const db  = "mongodb://localhost:27017/files"
let main = require('./routings/routing.js');

mongoose.connect(db);
mongoose.connection.on('connected', () => {
  console.log('connect to the database ' + db)
})
mongoose.connection.on('error', (err) => {
  console.log('error to connect the database ' + err)
})
app.use(cors());
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });



//middleware  
app.use(busboyBodyParser({ limit: '10mb' }));
app.use(logger('dev'));
app.use('/', main);



// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });



const port = 3000;
app.listen(port, () => {
  console.log("Listening ..with port " + port);
});
