import Logo from '../../assets/images/imob.png'

//@ts-ignore
import { ReactComponent as PlusSolidSvg } from '../../assets/svgs/plus-solid.svg'
//@ts-ignore
import { ReactComponent as FileInvoiceSvg } from '../../assets/svgs/file-invoice-solid.svg'
//@ts-ignore
import { ReactComponent as BusSolidSvg } from '../../assets/svgs/bus-solid.svg'
//@ts-ignore
import { ReactComponent as UserSolid } from '../../assets/svgs/user-solid.svg'
//@ts-ignore
import { ReactComponent as DoorOpenSolidSvg } from '../../assets/svgs/door-open-solid.svg'

import { useLocation, useNavigate } from 'react-router-dom'
import { ReactNode, useEffect, useState } from 'react'
import { logout } from '../../helpers/logout'
import { FaCalendarAlt } from 'react-icons/fa'
// import { MdModeOfTravel } from 'react-icons/md';
import { FaClipboardList } from 'react-icons/fa'

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const [active, setActive] = useState(0)

  useEffect(() => {
    if (location.pathname.includes('/notas')) {
      setActive(1)
    }

    if (location.pathname.includes('/notas/cadastrar')) {
      setActive(0)
    }

    if (location.pathname.includes('veiculos')) {
      setActive(2)
    }

    if (location.pathname.includes('clientes')) {
      setActive(3)
    }
    if (location.pathname.includes('calendario')) {
      setActive(4)
    }
    // if (location.pathname.includes('trips')) {
    //   setActive(5);
    // }
    if (location.pathname.includes('trips')) {
      setActive(6)
    }
    // setActive(0);
  }, [location])

  return (
    <>
      <div className="w-1/5 flex h-screen flex-col justify-between bg-white shadow-lg z-10">
        <div className="px-4 py-6">
          <span className="h-10 w-full flex items-center justify-center pt-14 pb-16 px-8">
            {/* <img src={Logo} alt="Logo VDR Petri" /> */}
            <img width={100} src={Logo} alt="Logo" />
          </span>

          <div
            style={{ height: 0.2 }}
            className="bg-stone-300 rounded-lg mb-8 mt-2"
          ></div>

          <ul className="mt-6 space-y-3 px-3">
            {/* <li>
              <Item
                isActive={active == 0}
                onClick={() => navigate('/notas/cadastrar')}
              >
                <PlusSolidSvg height="22px" />
                Cadastrar Nota
              </Item>
            </li> */}
            {/* <li>
              <Item isActive={active == 1} onClick={() => navigate('/notas')}>
                <FileInvoiceSvg />
                Notas
              </Item>
            </li> */}
            {/* <li>
              <Item
                isActive={active == 2}
                onClick={() => navigate('/veiculos')}
              >
                <BusSolidSvg height="22px" />
                Veículos
              </Item>
            </li> */}

            <li>
              <Item
                isActive={active == 3}
                onClick={() => navigate('/clientes')}
              >
                <UserSolid height="22px" />
                Clientes
              </Item>
            </li>

            {/* <li>
              <Item isActive={active == 5} onClick={() => navigate('/trips')}>
                <MdModeOfTravel height="22" size={18} />
                Cadastrar Viagem
              </Item>
            </li> */}
            {/* <li>
              <Item isActive={active == 6} onClick={() => navigate('/trips')}>
                <FaClipboardList height="25px" />
                Viagens
              </Item>
            </li> */}

            {/* <li>
              <Item
                isActive={active == 4}
                onClick={() => navigate('/calendario')}
              >
                <FaCalendarAlt height="22px" />
                Calendário
              </Item>
            </li> */}
          </ul>
        </div>

        <div className="p-4 pb-6">
          <div
            style={{ height: 0.2 }}
            className="bg-stone-300 rounded-lg mb-6"
          ></div>

          <Item isActive={true} onClick={() => logout()}>
            <div className="w-full flex flex-row items-center justify-center gap-4">
              <DoorOpenSolidSvg height="16px" />
              <p className="text-sm">Sair da Plataforma</p>
            </div>
          </Item>
        </div>
      </div>
    </>
  )
}

interface ItemProps extends Button {
  isActive: boolean
  children: ReactNode
}

type Button = JSX.IntrinsicElements['button']

export function Item({ children, isActive, ...rest }: ItemProps) {
  const styles = isActive
    ? 'bg-primary/10 text-primary'
    : 'bg-gray/5 text-black/70'

  return (
    <button
      {...rest}
      className={
        styles +
        ' flex flex-row gap-3 items-center  rounded-lg w-full shadow-sm text-base font-medium px-6 py-2.5'
      }
    >
      {children}
    </button>
  )
}
