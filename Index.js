import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const BASE_URL = 'https://newsapi.org/v2';

app.get('/api/news', async (req, res) => {
  try {
    const { q = 'fashion', page = 1 } = req.query;

    const response = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q,
        pageSize: 20,
        language: 'en',
        sortBy: 'publishedAt',
        apiKey: process.env.NEWS_API_KEY,
        page
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
