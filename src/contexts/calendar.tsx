import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

interface CalendarProviderProps {
  children: ReactNode;
}
interface ICalendarContextData {
  teste: () => void;
  stateVehicles: string[];
  stateTypes: string[];
  handleChangeVehicles: (id: string) => void;
  handleChangeTypes: (types: string) => void;
}

const CalendarContext = createContext({} as ICalendarContextData);
function CalendarProvider({ children }: CalendarProviderProps) {
  const [stateVehicles, setStateVehicles] = useState<string[]>([]);
  const [stateTypes, setStateTypes] = useState<string[]>([]);


  const handleChangeVehicles = (id: string) => {
    setStateVehicles((prevState: string[]) => {
      const index = prevState.indexOf(id);
      if (index !== -1) {
        prevState.splice(index, 1);
      } else {
        prevState.push(id);
      }
      return [...new Set(prevState)];
    });
  };

  const handleChangeTypes = (types: string) => {

    setStateTypes((prevState: string[]) => {
      if (prevState.includes(types)) {
        return prevState.filter((type: string) => type !== types);
      } else {
        return [...prevState, types];
      }
    });
  };

  return (
    <CalendarContext.Provider
      //@ts-ignore
      value={{
        stateVehicles,
        stateTypes,
        handleChangeVehicles,
        handleChangeTypes,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

function useCalendar() {
  const context = useContext(CalendarContext);
  return context;
}

export { CalendarProvider, useCalendar };
