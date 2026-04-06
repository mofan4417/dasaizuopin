import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { ServiceObject, Application, Stats } from './models';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xiangzhuqiao')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Auth Middleware
const auth = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send({ error: 'Please authenticate.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// --- ROUTES ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    res.send({ token });
  } else {
    res.status(401).send({ error: 'Invalid credentials' });
  }
});

// Stats: View Count
app.post('/api/stats/view', async (req, res) => {
  try {
    let stats = await Stats.findOne({ key: 'main' });
    if (!stats) {
      stats = new Stats({ key: 'main', viewCount: 1 });
    } else {
      stats.viewCount += 1;
    }
    await stats.save();
    res.send({ viewCount: stats.viewCount });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await Stats.findOne({ key: 'main' }) || { viewCount: 0, heroImage: '', photoWall: [] };
    res.send(stats);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Service Objects
app.get('/api/objects', async (req, res) => {
  try {
    const objects = await ServiceObject.find().sort({ createdAt: -1 });
    res.send(objects);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/api/objects', auth, async (req, res) => {
  try {
    const obj = new ServiceObject(req.body);
    await obj.save();
    res.status(201).send(obj);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.put('/api/objects/:id', auth, async (req, res) => {
  try {
    const obj = await ServiceObject.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.send(obj);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/api/objects/:id', auth, async (req, res) => {
  try {
    await ServiceObject.findOneAndDelete({ id: req.params.id });
    res.send({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Applications
app.get('/api/applications', auth, async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    res.send(apps);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const app = new Application(req.body);
    await app.save();
    res.status(201).send(app);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.patch('/api/applications/:id', auth, async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(app);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.delete('/api/applications/:id', auth, async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.send({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Image Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.post('/api/upload', auth, upload.single('image'), (req: any, res) => {
  if (!req.file) return res.status(400).send({ error: 'No file uploaded' });
  res.send({ url: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
