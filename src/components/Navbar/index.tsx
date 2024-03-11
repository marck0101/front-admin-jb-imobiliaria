//@ts-ignore
import { ReactComponent as DoorOpenSolidSvg } from '../../assets/svgs/door-open-solid.svg';
import { logout } from '../../helpers/logout';

export function Navbar() {
  return (
    <>
      <div className="shadow-sm z-0 bg-white h-16 py-6 flex flex-row justify-end items-center px-12">
        <button
          onClick={() => logout()}
          className="flex flex-row items-center justify-center gap-2 text-black/70"
        >
          <p className="text-sm">
            <DoorOpenSolidSvg />
          </p>
          <p className="font-semibold">Sair</p>
        </button>
      </div>
    </>
  );
}
