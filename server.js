import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { APP_PORT } from './config';
import errorHandler from './middlewares/errorHandler';

import { connectDB } from './database';
connectDB();

global.appRoot = path.resolve(__dirname); //return path to project for i.e: F:\Dharmesh\nodeprojects\superbazaar

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false })); //to parse body from url
app.use(express.json()); //to parse json content
app.use(express.static(path.resolve('./public')));
app.use('/uploads', express.static('uploads'));

import routes from './routes';
app.use('/api', routes);
app.use('/', (req, res) => {
    res.json({ message: "Welcome to Superbazaar." });
});
app.use(errorHandler);

const PORT = process.env.PORT || APP_PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));