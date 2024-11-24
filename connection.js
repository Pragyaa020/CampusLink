const mongoose = require("mongoose") ;

async function connectDBtoWeb(url) {
    return mongoose.connect(url) ;
}

module.exports = {connectDBtoWeb} ;
//comment added
