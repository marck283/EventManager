const app = require('./app/app.js');
const mongoose = require('mongoose');

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuZtlyfk2C46hNxmSTv9fG3vGYYlDz7yg",
  authDomain: "eventmanager-cbe2d.firebaseapp.com",
  projectId: "eventmanager-cbe2d",
  storageBucket: "eventmanager-cbe2d.appspot.com",
  messagingSenderId: "666454225517",
  appId: "1:666454225517:web:721eb8a341dbeedaac8564",
  measurementId: "G-D19RMY08YF"
};

// Initialize Firebase
const appf = initializeApp(firebaseConfig);


require('dotenv').config();


const port = process.env.PORT || 8080;


/**
 * Configure mongoose
 */
// mongoose.Promise = global.Promise;

app.locals.db = mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then ( () => {
    
    console.log("Connected to Database!");

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
    
});
