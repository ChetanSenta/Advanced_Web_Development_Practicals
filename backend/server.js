import bcrypt from 'bcryptjs'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 5000)
const jwtSecret = process.env.JWT_SECRET

if (!process.env.MONGODB_URI || !jwtSecret) {
  throw new Error('MONGODB_URI and JWT_SECRET must be set in backend/.env.')
}

const allowedOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173'])
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    return callback(new Error('Origin is not allowed by the task API.'))
  },
}))
app.use(express.json())

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true })

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
const Task = mongoose.model('Task', taskSchema)

function requireAuth(request, response, next) {
  const authorization = request.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) return response.status(401).json({ message: 'Authentication is required.' })
  try {
    request.user = jwt.verify(token, jwtSecret)
    return next()
  } catch {
    return response.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }
}

app.get('/health', (_request, response) => response.json({ message: 'Task server is running.' }))

app.post('/register', async (request, response) => {
  try {
    const email = String(request.body.email || '').trim().toLowerCase()
    const password = String(request.body.password || '')
    if (!email || password.length < 6) return response.status(400).json({ message: 'A valid email and password of at least 6 characters are required.' })
    if (await User.exists({ email })) return response.status(409).json({ message: 'An account with this email already exists.' })
    const passwordHash = await bcrypt.hash(password, 12)
    await User.create({ email, passwordHash })
    return response.status(201).json({ email })
  } catch (error) {
    console.error('Registration failed:', error)
    return response.status(500).json({ message: 'Unable to create the account.' })
  }
})

app.post('/login', async (request, response) => {
  try {
    const email = String(request.body.email || '').trim().toLowerCase()
    const password = String(request.body.password || '')
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return response.status(401).json({ message: 'Email or password is incorrect.' })
    return response.json({ token: jwt.sign({ userId: user._id.toString(), email: user.email }, jwtSecret, { expiresIn: '7d' }), email: user.email })
  } catch (error) {
    console.error('Login failed:', error)
    return response.status(500).json({ message: 'Unable to sign in.' })
  }
})

app.get('/tasks', requireAuth, async (request, response) => {
  try {
    return response.json(await Task.find({ userId: request.user.userId }).sort({ createdAt: -1 }))
  } catch (error) {
    console.error('Task fetch failed:', error)
    return response.status(500).json({ message: 'Unable to load tasks.' })
  }
})

app.post('/tasks', requireAuth, async (request, response) => {
  try {
    const title = String(request.body.title || '').trim()
    if (!title) return response.status(400).json({ message: 'Task title is required.' })
    const task = await Task.create({ title, description: String(request.body.description || '').trim(), userId: request.user.userId })
    return response.status(201).json(task)
  } catch (error) {
    console.error('Task creation failed:', error)
    return response.status(500).json({ message: 'Unable to create the task.' })
  }
})

app.put('/tasks/:id', requireAuth, async (request, response) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: request.params.id, userId: request.user.userId }, { $set: { completed: Boolean(request.body.completed) } }, { new: true, runValidators: true })
    if (!task) return response.status(404).json({ message: 'Task not found.' })
    return response.json(task)
  } catch (error) {
    console.error('Task update failed:', error)
    return response.status(400).json({ message: 'Unable to update the task.' })
  }
})

app.delete('/tasks/:id', requireAuth, async (request, response) => {
  try {
    const task = await Task.findOneAndDelete({ _id: request.params.id, userId: request.user.userId })
    if (!task) return response.status(404).json({ message: 'Task not found.' })
    return response.status(204).end()
  } catch (error) {
    console.error('Task deletion failed:', error)
    return response.status(400).json({ message: 'Unable to delete the task.' })
  }
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`Task server running at http://localhost:${port}`)))
  .catch((error) => {
    console.error('MongoDB connection failed:', error)
    process.exit(1)
  })
