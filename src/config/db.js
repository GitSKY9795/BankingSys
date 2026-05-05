const mongoose = require('mongoose');
function connectToDatabase() {
   const uri = process.env.MONGODB_URI;

   if (!uri) {
      console.error('MONGODB_URI is not defined in the environment');
      process.exit(1);
   }

mongoose.connect(uri)
   .then(() => {
      console.log('Connected to MongoDB successfully');
   })
   .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
   });}
module.exports = connectToDatabase;