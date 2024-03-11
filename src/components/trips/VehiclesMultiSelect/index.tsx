//@ts-ignore
import React, { useState } from 'react';
import './style.css';

import { useFetch } from '../../../hooks/useFetch';
import { useCalendar } from '../../../contexts/calendar';

interface Vehicle {
  _id: string;
  name: string;
  checked: boolean;
  color: string;
  data: DataProp;
}

interface DataProp {
  data: Vehicle;
}

export const VehiclesMultipleSelect: React.FC = () => {
  const { api } = useFetch();

  const { handleChangeVehicles } = useCalendar();

  const [isOpen, setIsOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Vehicle[]>([]);

  const handleSelectClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: Vehicle, callback?: () => void) => {
    handleChangeVehicles(item._id);

    const updatedCheckedItems = checkedItems.map((checkedItem) => {
      if (checkedItem._id === item._id) {
        return { ...checkedItem, checked: !checkedItem.checked };
      } else {
        return checkedItem;
      }
    });

    setCheckedItems(updatedCheckedItems);
    callback?.();
  };

  const checkedCount = checkedItems.filter((item) => item.checked).length;

  React.useEffect(() => {
    buscaVehicles();
  }, []);

  const buscaVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      setCheckedItems(
        response.data.data.map((vehicle: Vehicle) => ({
          _id: vehicle?._id,
          name: vehicle?.name,
          checked: false,
          color: vehicle?.color,
        })),
      );
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
            : 'Selecionar Veículo'}
        </span>
        {/* <span className="arrow-dwn">
          <i className="fa-solid fa-chevron-down"></i>
        </span> */}
      </div>

      {isOpen && (
        <ul className="list-items">
          {checkedItems.map((item: Vehicle) => (
            <li
              key={item._id}
              className={`item ${item?.checked ? 'checked' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <span
                className="checkbox"
                style={{
                  backgroundColor: item.checked ? item.color : 'white',
                  borderColor: item.checked ? item.color : '#c0c0c0',
                }}
              >
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
