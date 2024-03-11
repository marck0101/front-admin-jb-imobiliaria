/* eslint-disable @typescript-eslint/no-unused-vars */
import { FiX } from 'react-icons/fi';
import { MdOutlinePictureAsPdf } from 'react-icons/md';

interface PropsInf {
  size: string;
  type: string;
}

interface PropsFile {
  name: string;
  size: string;
  type: string;
}

interface Props {
  name: string;
  url?: string;
  inf: PropsInf;
  file?: PropsFile;
  onPreview: () => void;
  onDelete: () => void;
}

const ImgView = ({ name, url, inf, file, onPreview, onDelete }: Props) => {
  const handleOpen = () => {
    onPreview();
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <>
      <article className="rounded-xl border border-slate-300 shadow-sm py-4 px-6 w-full">
        <div className="flex items-center gap-4">
          <div onClick={handleOpen}>
            {url ? (
              <>
                {/* depois de já ter ido para o banco */}
                {inf.type !== 'application/pdf' ? (
                  <img
                    alt="imagem"
                    //@ts-ignore
                    src={url ? url : URL.createObjectURL(file)}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <MdOutlinePictureAsPdf size={45} className="m-0.5" />
                )}
              </>
            ) : (
              <>
                {/* antes de ir para o banco  */}
                {file?.type !== 'application/pdf' ? (
                  <img
                    alt="imagem"
                    //@ts-ignore
                    src={url ? url : URL.createObjectURL(file)}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <MdOutlinePictureAsPdf size={45} className="m-0.5" />
                )}
              </>
            )}
          </div>

          <div className="w-full">
            <p className="mt-1 text-sm font-medium">{name}</p>
            <div className="flex flex-row flex-nowrap justify-start">
              {inf?.size && (
                <p className="mr-2 text-gray text-xs mt-1">{inf?.size}Mb</p>
              )}

              {file && (
                <p className="mr-2 text-gray text-xs mt-1">{file.type}</p>
              )}

              <p className="mr-2 text-gray text-xs mt-1">{inf?.type}</p>
            </div>
          </div>
          <div style={{ cursor: 'pointer' }} onClick={() => handleDelete()}>
            <FiX size={25} className="mr-1 text-gray/60" />
          </div>
        </div>
      </article>
    </>
  );
};

export default ImgView;
