const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Use environment variables for live server, fallback to local for development
const db = mysql.createConnection({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || 'Abdullah@123',
  database: process.env.DB_NAME     || 'brieflyecho',
  port:     process.env.DB_PORT     || 3306,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false
});

db.connect(err => {
  if (err) { console.error('DB connection failed:', err.message); return; }
  console.log('MySQL connected!');

  // Auto create table if not exists
  db.query(`
    CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'General',
      content TEXT NOT NULL,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/', (req, res) => res.json({ status: 'BrieflyEcho API running!' }));

app.get('/api/news', (req, res) => {
  db.query('SELECT * FROM news ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/news/:id', (req, res) => {
  db.query('SELECT * FROM news WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  });
});

app.post('/api/news', upload.single('image'), (req, res) => {
  const { title, category, content } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  db.query(
    'INSERT INTO news (title, category, content, image_url) VALUES (?, ?, ?, ?)',
    [title, category || 'General', content, image_url],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, message: 'News published!' });
    }
  );
});

app.delete('/api/news/:id', (req, res) => {
  db.query('DELETE FROM news WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted successfully' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
