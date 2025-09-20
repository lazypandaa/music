const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity, restrict in production
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-super-secret-key-that-should-be-in-env-vars';

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const MONGO_URI = "mongodb+srv://test:703vr9FJwzKmfc4h@hack.8syianl.mongodb.net/hack";
mongoose.connect(MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB."))
  .catch(err => console.error("MongoDB connection error:", err));

// --- Mongoose Schemas ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }
});

const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trackId: { type: String, required: true },
    trackData: { type: Object, required: true }
});
favoriteSchema.index({ userId: 1, trackId: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Favorite = mongoose.model('Favorite', favoriteSchema);

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error signing up user.', error });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials.' });
        const token = jwt.sign({ username: user.username, id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ result: { id: user._id, username: user.username }, token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.', error });
    }
});

// --- Middleware to verify token ---
const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Authentication failed: No token provided." });
        const decodedData = jwt.verify(token, JWT_SECRET);
        req.userId = decodedData?.id;
        next();
    } catch (error) {
        res.status(401).json({ message: "Authentication failed: Invalid token." });
    }
};

// --- Favorites Routes (Protected) ---
app.get('/api/favorites', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId });
    res.json(favorites.map(fav => fav.trackData));
  } catch (error) { res.status(500).json({ message: 'Error fetching favorites' }); }
});

app.post('/api/favorites', auth, async (req, res) => {
  const { track } = req.body;
  try {
    const newFavorite = new Favorite({ userId: req.userId, trackId: track.trackId, trackData: track });
    await newFavorite.save();
    res.status(201).json(newFavorite.trackData);
  } catch (error) {
     if (error.code === 11000) return res.status(409).json({ message: 'Track is already in favorites.' });
    res.status(500).json({ message: 'Error adding favorite' });
  }
});

app.delete('/api/favorites/:trackId', auth, async (req, res) => {
  try {
    const { trackId } = req.params;
    await Favorite.deleteOne({ userId: req.userId, trackId });
    res.status(200).json({ message: 'Favorite removed successfully.' });
  } catch (error) { res.status(500).json({ message: 'Error removing favorite' }); }
});

// --- Socket.io Real-time Logic ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session: ${sessionId}`);
    // Notify others in the room that a user has joined
    socket.to(sessionId).emit('user_joined', { user: 'A new user', text: 'has joined the session.'});
  });

  socket.on('playback_control', (data) => {
    // data = { sessionId, action, track, timestamp }
    // Broadcast to everyone in the room *except* the sender
    socket.to(data.sessionId).emit('update_playback', data);
  });

  socket.on('chat_message', (data) => {
    // data = { sessionId, user, text }
    // Broadcast to everyone in the room (including sender for confirmation)
    io.to(data.sessionId).emit('new_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // You could add logic here to notify rooms the user was in
  });
});


// --- Start Server ---
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

