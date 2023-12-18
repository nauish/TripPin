import express from 'express';
import http from 'http';
import cors from 'cors';
import userRouter from './routes/userRouter.js';
import authRouter from './routes/authRouter.js';
import tripRouter from './routes/tripRouter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocketIO } from './controllers/socket.js';
import rateLimiter from './middleware/rateLimiter.js';

const app = express();
const server = http.createServer(app);
initSocketIO(server, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('./uploads'));
app.use('/', express.static('./public'));

app.use('/api', rateLimiter, [userRouter, tripRouter, authRouter]);

app.use(errorHandler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`The Server is listening on port ${port}`);
});
