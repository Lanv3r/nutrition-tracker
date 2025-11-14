import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import MainPage from './pages/MainPage'
import Signup from './pages/Signup'


type Screen = 'login' | 'signup' | 'main-page'

function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [userId, setUserId] = useState<number | null>(null);

  const goToLogin = () => setScreen('login')
  const goToSignup = () => setScreen('signup')
  const goToMainPage = () => setScreen('main-page')

  if (screen === 'login') {
    return <Login onSuccess={(id) => { setUserId(id); goToMainPage(); }} onGoToSignup={goToSignup}/>
  } else if (screen === 'signup') {
    return <Signup onSuccess={goToMainPage} onGoToLogin={goToLogin}/>
  } else {
    return <MainPage userId={userId!}/>
  }
}

export default App
