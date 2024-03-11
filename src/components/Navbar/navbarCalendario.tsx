//@ts-ignore
import { ReactComponent as DoorOpenSolidSvg } from '../../assets/svgs/door-open-solid.svg';
import { logout } from '../../helpers/logout';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { Grid, Tooltip } from '@mui/material';

export function NavbarCalendario() {
  const navigate = useNavigate();

  function returnCadastro() {
    navigate('/notas/cadastrar');
  }

  return (
    <>
      <div className="shadow-sm z-0 bg-white h-16 py-6 flex flex-row justify-end items-center px-12">
        <Grid
          container
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignContent: 'space-between',
          }}
        >
          <Grid item xs={6}>
            <Tooltip title={'voltar'}>
              <button onClick={() => returnCadastro()}>
                <IoIosArrowBack size={25} />
              </button>
            </Tooltip>
          </Grid>

          <Grid
            item
            xs={6}
            style={{ display: 'flex', flexDirection: 'row-reverse' }}
          >
            <button
              onClick={() => logout()}
              className="flex flex-row items-center justify-center gap-2 text-black/70"
            >
              <p className="text-sm">
                <DoorOpenSolidSvg />
              </p>
              <p className="font-semibold">Sair</p>
            </button>
          </Grid>
        </Grid>
      </div>
    </>
  );
}
