import express from 'express';
import { Session } from './db.js';
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    const s = Session.create({
        status: 'active'
    })
    
  res.send('Hello, World!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;