require('dotenv').config();
const mongoose = require('mongoose');
var app;
import('./app/app.mjs').then(a => {
    app = a.default;

    const port = process.env.PORT || 8080;

    /**
     * Configure mongoose
     */
    //mongoose.set('strictQuery', false);
    app.locals.db = mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {

            console.log("Connected to Database!");

            app.listen(port, () => {
                console.log(`Server listening on port ${port}`);
            });

        });
});
