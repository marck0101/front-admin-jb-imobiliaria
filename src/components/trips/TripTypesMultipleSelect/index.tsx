//@ts-ignore
import React, { useState } from 'react';
import './style.css';
import { useCalendar } from '../../../contexts/calendar';

interface Vehicle {
  _id: string;
  name: string;
  checked: boolean;
  type: string;
}

interface ResponseProp {
  type: string;
  name: string;
  checked: boolean;
}

export const TripTypesMultipleSelect: React.FC = () => {
  const { handleChangeTypes } = useCalendar();

  const [isOpen, setIsOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState([] as Array<Vehicle>);

  const handleSelectClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: Vehicle, callback: () => void) => {
    handleChangeTypes(item?.type);

    const updatedCheckedItems = checkedItems.map(
      (checkedItem: ResponseProp) => {
        if (checkedItem?.type === item?.type) {
          return { ...checkedItem, checked: !checkedItem.checked };
        } else {
          return checkedItem;
        }
      },
    );

    //@ts-ignore
    setCheckedItems(updatedCheckedItems);
    callback();
  };

  const checkedCount = checkedItems.filter((item) => item.checked).length;

  React.useEffect(() => {
    buscaVehicles();
  }, []);

  const buscaVehicles = async () => {
    try {
      const response: ResponseProp[] = [
        { type: 'SCHEDULED', name: 'Viagem Programada', checked: false },
        { type: 'CHARTER', name: 'Fretamento', checked: false },
        { type: 'UNIVERSITY', name: 'Universidade', checked: false },
      ];
      //@ts-ignore
      setCheckedItems(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <div className="select-btn" onClick={handleSelectClick}>
        <span className="btn-text">
          {checkedCount > 0
            ? `${checkedCount} Selecionados`
            : 'Selecionar Tipos'}
        </span>
        {/* <span className="arrow-dwn">
          <i className="fa-solid fa-chevron-down"></i>
        </span> */}
      </div>

      {isOpen && (
        <ul className="list-items">
          {/* {console.log('return===>', vehiclesData)} */}
          {checkedItems.map((item: Vehicle) => (
            <li
              key={item._id}
              className={`item ${item.checked ? 'checked' : ''}`}
              //@ts-ignore
              onClick={() => handleItemClick(item)}
            >
              <span className="checkbox">
                <i
                  className="fa-solid fa-check check-icon"
                  style={{ visibility: item.checked ? 'visible' : 'hidden' }}
                ></i>
              </span>
              <span className="item-text">{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
