import { useEffect, useState } from 'react'
import {
  createTask,
  deleteTask,
  getTasks,
  isAuthenticated,
  login,
  logout,
  register,
  updateTask,
} from '../api'

export default function TaskManager() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ title: '', description: '' })
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [authenticated, setAuthenticated] = useState(isAuthenticated)
  const [authMode, setAuthMode] = useState('login')
  const [loading, setLoading] = useState(isAuthenticated)
  const [saving, setSaving] = useState(false)
  const [busyTaskId, setBusyTaskId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!authenticated) return undefined
    let cancelled = false
    setLoading(true)
    setError('')
    getTasks()
      .then((data) => {
        if (!cancelled) setTasks(data)
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [authenticated])

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      if (authMode === 'register') await register(credentials)
      await login(credentials)
      setAuthenticated(true)
      setCredentials({ email: '', password: '' })
      setSuccess(authMode === 'register' ? 'Account created and signed in successfully.' : 'Signed in successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTaskSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const task = await createTask(form)
      setTasks((currentTasks) => [task, ...currentTasks])
      setForm({ title: '', description: '' })
      setSuccess('Task created successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (task) => {
    setBusyTaskId(task._id)
    setError('')
    try {
      const updatedTask = await updateTask(task._id, { completed: !task.completed })
      setTasks((currentTasks) => currentTasks.map((currentTask) => currentTask._id === updatedTask._id ? updatedTask : currentTask))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyTaskId(null)
    }
  }

  const handleDelete = async (taskId) => {
    setBusyTaskId(taskId)
    setError('')
    try {
      await deleteTask(taskId)
      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyTaskId(null)
    }
  }

  const handleLogout = () => {
    logout()
    setAuthenticated(false)
    setTasks([])
    setSuccess('')
  }

  return (
    <section className="content-section task-manager-page">
      <div className="task-manager-page__inner">
        <p className="eyebrow">Practical 6</p>
        <h1>Task <em>Manager.</em></h1>
        <div className="task-manager">
          <div className="task-manager__intro">
            <h2>{authenticated ? 'Manage your work.' : 'Sign in to manage tasks.'}</h2>
            <p>{authenticated ? 'Create, complete, and remove tasks stored in MongoDB.' : 'Authenticate with the Node and MongoDB backend to continue.'}</p>
          </div>
          {authenticated ? (
            <form className="task-form" onSubmit={handleTaskSubmit}>
              <label htmlFor="task-title">Title<input id="task-title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label htmlFor="task-description">Description<textarea id="task-description" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              <div className="task-form__actions">
                <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add task'}</button>
                <button className="button button-secondary" type="button" onClick={handleLogout}>Sign out</button>
              </div>
            </form>
          ) : (
            <form className="task-form" onSubmit={handleAuthSubmit}>
              <label htmlFor="auth-email">Email<input id="auth-email" type="email" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></label>
              <label htmlFor="auth-password">Password<input id="auth-password" type="password" minLength="6" required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} /></label>
              <div className="task-form__actions">
                <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Working...' : authMode === 'login' ? 'Sign in' : 'Create account'}</button>
                <button className="button button-secondary" type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}</button>
              </div>
            </form>
          )}
          <div className="task-list" aria-live="polite">
            {error && <p className="task-message task-error" role="alert">{error}</p>}
            {success && <p className="task-message task-success" role="status">{success}</p>}
            {loading ? <p className="task-empty">Loading tasks...</p> : tasks.length === 0 ? <p className="task-empty">No tasks yet.</p> : tasks.map((task) => (
              <article className={`task-card${task.completed ? ' task-card--done' : ''}`} key={task._id}>
                <div className="task-card__top">
                  <div><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}</div>
                  <span className={`task-status ${task.completed ? 'task-status--done' : 'task-status--pending'}`}>{task.completed ? 'Completed' : 'Pending'}</span>
                </div>
                <div className="task-card__actions">
                  <button className="button button-secondary" type="button" disabled={busyTaskId === task._id} onClick={() => handleToggle(task)}>{task.completed ? 'Mark incomplete' : 'Complete'}</button>
                  <button className="button task-action--delete" type="button" disabled={busyTaskId === task._id} onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
