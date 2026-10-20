import './App.css'
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import NavBar from './components/NavBar'
import Projects from './components/Projects'
import Contact from './pages/Contact'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import TaskManager from './pages/TaskManager'
import { projects } from './data/portfolio'

function App() {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.dataset.theme === 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    localStorage.setItem('portfolio-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <div className="app">
      <NavBar darkMode={darkMode} onToggleTheme={() => setDarkMode((isDark) => !isDark)} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects projectList={projects} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer email="chetansenta11@gmail.com" phone="+91 635440XXXX" />
    </div>
  )
}

export default App
