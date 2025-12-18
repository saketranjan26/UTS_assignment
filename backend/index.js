import express from 'express';
import rootRouter from './routes/index.js';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', rootRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;