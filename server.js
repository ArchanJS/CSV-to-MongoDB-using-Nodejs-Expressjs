const express = require('express');
require('dotenv').config({ path: "./config.env" });
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const port = process.env.PORT;
const app = express();
const fileUpload=require('express-fileupload');
require('./db/conn');

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload());


app.use('/api/auth', require('./routes/auth'));
app.use('/api/private', require('./routes/private'));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})