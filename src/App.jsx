import './App.css'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import LoadingFallback from './components/LoadingFallback'
import NavBar from './components/NavBar'
import { projects } from './data/portfolio'

const Contact = lazy(() => import('./pages/Contact'))
const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Projects = lazy(() => import('./components/Projects'))
const TaskManager = lazy(() => import('./pages/TaskManager'))

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
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects projectList={projects} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer email="chetansenta11@gmail.com" phone="+91 635440XXXX" />
    </div>
  )
}

export default App
