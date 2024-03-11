/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Select } from '../Select';
import { MdOutlinePictureAsPdf } from 'react-icons/md';

const style = {
  position: 'absolute',
  borderRadius: 3,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSubmitUpload: (value: { name: string; file: File }) => void;
}

export default function BasicModal({ open, setOpen, onSubmitUpload }: Props) {
  const handleClose = () => {
    setOpen(false);
    // @ts-ignore
    document.querySelector('#formFileSm').value = '';
  };
  const [nameDoc, setNameDoc] = useState('Identidade');
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const onInputChange = () => {
      // @ts-ignore
      const [file] = document.querySelector('#formFileSm').files;
      setFileType(file.type);
      setFileName(file.name);

      // console.log(file)
      if (file) {
        // @ts-ignore
        document.querySelector('#preview').src = URL.createObjectURL(file);
      }
    };

    const onInputCancel = () => setOpen(false);

    const $input = document.querySelector('#formFileSm');

    $input?.addEventListener('change', onInputChange);
    $input?.addEventListener('cancel', onInputCancel);

    return () => {
      $input?.removeEventListener('change', onInputChange);
      $input?.removeEventListener('cancel', onInputCancel);
    };
  }, []);

  function heandleSubmit() {
    onSubmitUpload({
      name: nameDoc,
      // @ts-ignore
      file: document.querySelector('#formFileSm').files[0],
    });
    // @ts-ignore
    document.querySelector('#formFileSm').value = '';
    setNameDoc('Identidade');
    setFileType('');
    setFileName('');
  }

  return (
    <div>
      <Modal
        // @ts-ignore
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <h1>Adicionar arquivo</h1>

          <div
            className="mt-4"
            style={{ display: fileType && fileType != '' ? 'block' : 'none' }}
          >
            {fileType === 'application/pdf' && (
              <div className="flex">
                <MdOutlinePictureAsPdf size={55} />
                <div style={{ marginTop: 10, marginLeft: 15 }}>{fileName}</div>
              </div>
            )}
            <img
              id="preview"
              src="#"
              alt="Imagem"
              height={100}
              style={{
                display: fileType !== 'application/pdf' ? 'block' : 'none',
              }}
            />
          </div>

          <div className="flex flex-row mt-4 gap-2">
            <Select
              name="HeadlineAct"
              id="HeadlineAct"
              onChange={(e) => setNameDoc(e.target.value)}
            >
              <option value="identidade">Identidade</option>
              <option value="CPF">CPF</option>
              <option value="Carteira de Motorista">
                Carteira de Motorista
              </option>
              <option value="outro">Outro</option>
            </Select>
            <button
              className="bg-primary inline-block rounded-lg border px-12 mt-1 text-sm font-medium text-white hover:bg-primary/90 transition-all duration-150 focus:outline-none focus:ring"
              onClick={() => heandleSubmit()}
            >
              Adicionar
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
