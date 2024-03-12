import { Route, Routes, useLocation } from 'react-router-dom'

import { AnimatePresence } from 'framer-motion'

import Clientes from '../pages/admin/clientes'
import RegisterClientes from '../pages/admin/clientes/register'
// import { Vehicles } from '../pages/admin/vehicles'
// import { RegisterVehicle } from '../pages/admin/vehicles/register'
// import { Cteos } from '../pages/admin/cteos'
// import { RegisterCteos } from '../pages/admin/cteos/register'
// import Calendario from '../pages/admin/trips/calendar'
// import CadastroViagens from '../pages/admin/trips/register'
// import ListaViagem from '../pages/admin/trips/list'
// import { CalendarProvider } from '../contexts/calendar'
// import { useContext } from 'react';

export function AdminRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        {/* <Route path="/veiculos" index element={<Vehicles />} />
        <Route path="/veiculos/*" index element={<RegisterVehicle />} /> */}
        <Route path="/clientes" index element={<Clientes />} />
        <Route path="/clientes/*" index element={<RegisterClientes />} />
        {/* <Route
          path="/calendario/"
          index
          element={
            <CalendarProvider>
              <Calendario />
            </CalendarProvider>
          }
        /> */}
        {/* <Route path="/trips" index element={<ListaViagem />} />
        <Route path="/trips/*" index element={<CadastroViagens />} /> */}
        <Route path="/*" index element={<Clientes />} />
        {/* <Route path="/notas/cadastrar" index element={<RegisterCteos />} /> */}
      </Routes>
    </AnimatePresence>
  )
}
