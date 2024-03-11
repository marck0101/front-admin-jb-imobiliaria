import { BrowserRouter } from 'react-router-dom'

import 'react-toastify/dist/ReactToastify.css'

import * as dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
dayjs.locale('pt-br')

import { ToastContainer } from 'react-toastify'
import { Routes } from './routes'
import { AuthProvider } from './contexts/auth'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes />
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
