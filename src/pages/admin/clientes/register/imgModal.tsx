/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

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
  handleClose: () => void;
  url: string;
  name: string;
  type: string;
}

//@ts-ignore
export default function ImgModal({
  open,
  handleClose,
  url,
  name,
  type,
}: Props) {
  const [isZoomed] = React.useState(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {name ? name.toUpperCase() : '--/--/--'}
          <div style={{ marginTop: 10 }}>
            {/* A imagem e o pdf caem aqui ANTES de ir para o banco */}

            {(type !== undefined ? type : 'undefined') !==
              'application/pdf' && (
              <img
                alt="imagem"
                src={url}
                style={{ width: '100%', height: '100%' }}
              />
            )}

            {/* Cai aqui DEPOIS de ir para o banco */}
            {(type !== undefined ? type : 'undefined') ===
              'application/pdf' && (
              <>
                <div
                  style={{
                    width: '100%',
                    height: isZoomed ? '600px' : '500px',
                    border: '1px solid #ccc',
                    // Para esconder o conteúdo fora da área visível
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    src={url}
                    width="100%"
                    height="100%"
                    title="PDF Preview"
                  />
                </div>
              </>
            )}
          </div>
        </Box>
      </Modal>
    </div>
  );
}
