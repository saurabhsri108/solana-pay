require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const payments = require('./routes/pay');

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://beanshopee.vercel.app'],
  })
);
app.use(express.json());

app.use('/api/v1', payments);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
