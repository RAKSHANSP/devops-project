const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

/* ==============================
   STATIC FRONTEND (Angular)
============================== */

const PUBLIC_DIR = path.join(__dirname, "public");
app.use(express.static(PUBLIC_DIR));


// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true }); // Ensure directory is created with proper permissions
}
// Serve uploaded files statically
app.use('/uploads', express.static(UPLOAD_DIR));

mongoose.connect('mongodb://localhost:27017/agrconnect', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// ===== Schemas =====
const UserSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  role: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  imageUrl: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postedDate: { type: Date, default: Date.now },
});
ProductSchema.index({ name: 1, postedBy: 1 }, { unique: true });
const Product = mongoose.model('Product', ProductSchema);

const DealerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String, required: true },
  productsOffered: [{ type: String }],
  rating: { type: Number, default: 4.5 },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedDate: { type: Date, default: Date.now },
});
DealerSchema.index({ name: 1, location: 1 }, { unique: true });
const Dealer = mongoose.model('Dealer', DealerSchema);

const MarketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  timings: { type: String, required: true },
  contact: { type: String, required: true },
  commodities: [{ type: String }],
  rating: { type: Number, default: 4.0 },
  postedDate: { type: Date, default: Date.now },
});
MarketSchema.index({ name: 1, location: 1 }, { unique: true });
const Market = mongoose.model('Market', MarketSchema);

const PostSchema = new mongoose.Schema({
  text: { type: String, required: true },
  imageUrl: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postedDate: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});
const Post = mongoose.model('Post', PostSchema);

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commentedDate: { type: Date, default: Date.now },
});
const Comment = mongoose.model('Comment', CommentSchema);

const LikeSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  likedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likedDate: { type: Date, default: Date.now },
});
const Like = mongoose.model('Like', LikeSchema);

// ===== Govt Message Schema =====
const GovtMessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postedDate: { type: Date, default: Date.now },
});
const GovtMessage = mongoose.model('GovtMessage', GovtMessageSchema);

// ===== Individual Message Schema =====
const IndividualMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String }, // Made optional to allow file-only messages
  sentDate: { type: Date, default: Date.now },
  fileUrl: { type: String } // Added for file attachments
});
const IndividualMessage = mongoose.model('IndividualMessage', IndividualMessageSchema);

// ===== Group Message Schema =====
const GroupMessageSchema = new mongoose.Schema({
  groupId: { type: String, default: 'global' }, // For future groups
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String }, // Made optional to allow file-only messages
  sentDate: { type: Date, default: Date.now },
  fileUrl: { type: String } // Added for file attachments
});
const GroupMessage = mongoose.model('GroupMessage', GroupMessageSchema);

const JWT_SECRET = '1234567890'; // Change in production

// ===== Multer for image and file upload =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Only images, PDFs, Word docs, or text files are allowed.`), false);
    }
  }
});

// ===== Auth Middleware =====
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdminRole = (req, res, next) => {
  User.findById(req.user.userId)
    .then(user => {
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      req.user.fullUser = user;
      next();
    })
    .catch(() => res.status(500).json({ message: 'Server error' }));
};

// ===== Auth Routes =====
app.post('/signup', async (req, res) => {
  const { name, role, email, password } = req.body;
  try {
    let user = await User.findOne({ name });
    if (user) return res.status(400).json({ message: 'Username already taken' });
    user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, role: role || 'user', email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Login successful', role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Product Routes =====
app.post('/products', authenticateToken, upload.single('image'), async (req, res) => {
  const { name, description, quantity, price, location, phone } = req.body;
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const product = new Product({ name, description, quantity, price, location, phone, imageUrl, postedBy: req.user.userId });
    await product.save();
    res.status(201).json({ message: 'Product added', product });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Duplicate product entry' });
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/products', async (req, res) => {
  const { search } = req.query;
  try {
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const products = await Product.find(query).populate('postedBy', 'name');
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/products/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('postedBy');
    if (product.postedBy._id.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });
    const updateData = req.body;
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: 'Product updated', product: updated });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('postedBy');
    if (product.postedBy._id.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Dealer Routes =====
app.post('/dealers', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const dealer = new Dealer({ ...req.body, postedBy: req.user.fullUser._id });
    await dealer.save();
    res.status(201).json({ message: 'Dealer added', dealer });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Duplicate dealer entry' });
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/dealers', async (req, res) => {
  const { location } = req.query;
  try {
    const query = location ? { location: { $regex: location, $options: 'i' } } : {};
    const dealers = await Dealer.find(query).populate('postedBy', 'name');
    res.json(dealers);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Market Routes =====
app.post('/markets', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const market = new Market(req.body);
    await market.save();
    res.status(201).json({ message: 'Market added', market });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Duplicate market entry' });
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/markets', async (req, res) => {
  const { location } = req.query;
  try {
    const query = location ? { location: { $regex: location, $options: 'i' } } : {};
    const markets = await Market.find(query);
    res.json(markets);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Post Routes =====
app.post('/posts', authenticateToken, upload.single('image'), async (req, res) => {
  const { text } = req.body;
  try {
    if (!text && !req.file) return res.status(400).json({ message: 'Post must have text or an image' });
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const post = new Post({ text, imageUrl, postedBy: req.user.userId });
    await post.save();
    const populatedPost = await Post.findById(post._id).populate('postedBy', 'name role');
    res.status(201).json({ message: 'Post created', post: populatedPost });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ postedDate: -1 })
      .populate('postedBy', 'name role')
      .populate({ path: 'comments', populate: { path: 'commentedBy', select: 'name' } });
    res.json(posts);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.postedBy.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Not authorized' });
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Comment Routes =====
app.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  const { text } = req.body;
  try {
    if (!text.trim()) return res.status(400).json({ message: 'Comment text required' });
    const comment = new Comment({ text: text.trim(), post: req.params.postId, commentedBy: req.user.userId });
    await comment.save();
    await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: comment._id } });
    const populatedComment = await Comment.findById(comment._id).populate('commentedBy', 'name');
    res.status(201).json({ message: 'Comment added', comment: populatedComment });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Like Routes =====
app.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.userId;
    const existingLike = await Like.findOne({ post: postId, likedBy: userId });
    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
      const post = await Post.findById(postId);
      return res.json({ message: 'Unliked', likesCount: post ? post.likes.length : 0 });
    } else {
      const like = new Like({ post: postId, likedBy: userId });
      await like.save();
      await Post.findByIdAndUpdate(postId, { $push: { likes: userId } });
      const post = await Post.findById(postId);
      return res.json({ message: 'Liked', likesCount: post ? post.likes.length : 0 });
    }
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Govt Message Routes =====
app.post('/govt-messages', authenticateToken, async (req, res) => {
  const { text } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'govtOfficial') return res.status(403).json({ message: 'Govt official access required' });
    if (!text.trim()) return res.status(400).json({ message: 'Message required' });
    const message = new GovtMessage({ text, postedBy: req.user.userId });
    await message.save();
    const populatedMessage = await GovtMessage.findById(message._id).populate('postedBy', 'name');
    res.status(201).json({ message: 'Posted successfully', message: populatedMessage });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/govt-messages', async (req, res) => {
  try {
    const messages = await GovtMessage.find().sort({ postedDate: -1 }).populate('postedBy', 'name role');
    res.json(messages);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Individual Messaging Routes =====
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } }).select('name email role');
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/individual-messages', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { receiverId, text = '' } = req.body;
    const file = req.file;

    // Validate input
    if (!text.trim() && !file) {
      return res.status(400).json({ message: 'Message or file is required' });
    }
    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    // Create message
    const messageData = {
      sender: req.user.userId,
      receiver: receiverId,
      text: text.trim() || undefined,
      fileUrl: file ? `/uploads/${file.filename}` : undefined
    };
    console.log('Individual message data:', messageData); // Debug log
    const message = new IndividualMessage(messageData);
    await message.save();

    // Populate sender and receiver details
    const populatedMessage = await IndividualMessage.findById(message._id).populate('sender receiver', 'name');
    res.status(201).json({ message: 'Sent', message: populatedMessage });
  } catch (err) {
    console.error('Server error in /individual-messages:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

app.get('/individual-messages/:receiverId', authenticateToken, async (req, res) => {
  try {
    const messages = await IndividualMessage.find({
      $or: [
        { sender: req.user.userId, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.user.userId }
      ]
    }).sort({ sentDate: 1 }).populate('sender receiver', 'name');
    res.json(messages);
  } catch (err) {
    console.error('Server error in /individual-messages GET:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// ===== Group Message Routes =====
app.post('/group-messages', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { text = '', groupId = 'global' } = req.body;
    const file = req.file;

    // Validate input
    if (!text.trim() && !file) {
      return res.status(400).json({ message: 'Message or file is required' });
    }

    // Create message
    const messageData = {
      groupId,
      sender: req.user.userId,
      text: text.trim() || undefined,
      fileUrl: file ? `/uploads/${file.filename}` : undefined
    };
    const message = new GroupMessage(messageData);
    await message.save();

    // Populate sender details
    const populatedMessage = await GroupMessage.findById(message._id).populate('sender', 'role');
    res.status(201).json({ message: 'Message sent', message: populatedMessage });
  } catch (err) {
    console.error('Server error in /group-messages:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

app.get('/group-messages/:groupId', async (req, res) => {
  const { groupId = 'global' } = req.params;
  try {
    const messages = await GroupMessage.find({ groupId }).sort({ sentDate: 1 }).populate('sender', 'name role');
    res.json(messages);
  } catch (err) {
    console.error('Server error in /group-messages GET:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}); 

// ===== Start Server =====
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));