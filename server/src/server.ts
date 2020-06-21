import express from 'express';
import routes from './routes';
import cors from 'cors';
import path from 'path';

const app = express();

app.use(cors())
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use('/uploads_points', express.static(path.resolve(__dirname, '..', 'uploads_points')));

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Umbler listening on port %s', port);
});