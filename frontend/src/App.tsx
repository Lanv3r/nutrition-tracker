import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Signup from './pages/Signup'


type Screen = 'login' | 'signup' | 'dashboard'

function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [userId, setUserId] = useState<number | null>(null);

  const goToLogin = () => setScreen('login')
  const goToSignup = () => setScreen('signup')
  const goToDashboard = () => setScreen('dashboard')

  if (screen === 'login') {
    return <Login onSuccess={(id) => { setUserId(id); goToDashboard(); }} onGoToSignup={goToSignup}/>
  } else if (screen === 'signup') {
    return <Signup onSuccess={goToDashboard} onGoToLogin={goToLogin}/>
  } else {
    return <Dashboard userId={userId!}/>
  }
}

export default App
