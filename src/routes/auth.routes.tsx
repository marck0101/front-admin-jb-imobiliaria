import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { SignIn } from '../pages/auth/sign-in'

export function AuthRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/*" index element={<SignIn />} />
      </Routes>
    </AnimatePresence>
  )
}
