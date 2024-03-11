import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../../../components/PageWrapper';
import { Input } from '../../../../components/Input';
import { useEffect, useState } from 'react';

//@ts-ignore
import { ReactComponent as ArrowRightSolidSvg } from '../../../../assets/svgs/arrow-right-solid.svg';

import { Loader } from '../../../../components/Loader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFetch } from '../../../../hooks/useFetch';

//@ts-ignore
import dayjs from 'dayjs';

import { toast } from 'react-toastify';
import { formatToCPF } from '../../../../helpers/format-to-cpf';
import { formatToCep } from '../../../../helpers/format-to-cep';
import { getAddressByPostalCode } from '../../../../helpers/get-address-by-postal-code';

import { storage } from './firebase';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

import BasicModal from '../../../../components/modal';

import { Grid } from '@mui/material';

import ImgView from './ImgView';
import ImgModal from './imgModal';
import { NotFound } from '../../../../components/NotFound';
import { generateRandomUUID } from '../../../../helpers/generate-random-uuid';
import { Popup } from '../../../../components/Popup';
import { Select } from '../../../../components/Select';
import { IRequestError } from '../../../../@types/request-error';

const SCHEMA = z.object({
  name: z.string().min(3, 'Nome muito curto!'),
  fantasyname: z.string().optional(),
  bairro: z.string().optional(),
  number: z.string().optional(),
  rg: z.string().optional(),
  cpfCnpj: z.string().optional(),
  birthdate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  cep: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  logradouro: z.string().optional(),
  indicador_inscricao_estadual_tomador: z.string().optional(),
  inscricao_estadual_tomador: z.string().optional(),
});

interface InfFile {
  name: string;
  size: string;
  type: string;
  // file: InfFileProp;
}

interface FileProps {
  name: string;
  _id?: string;
  url?: string;
  file?: InfFile;
  size: string;
  type: string;
  imgURL: string;
  data: PreviewFileProps;
}

interface PreviewFileProps {
  name: string;
  type: string;
  url: string;
}

interface RegisterProps {
  logradouro: string;
  cep: string;
  cidade: string;
  number: string;
  estado: string;
  bairro: string;
  cpfCnpj: string;
  cpf: string;
  cnpj: string;
}

const RegisterClientes = () => {
  const navigate = useNavigate();
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [files, setFiles] = useState([] as Array<FileProps>);
  const [open, setOpen] = useState<boolean>(false);

  const [previewFile, setPreviewFile] = useState({} as PreviewFileProps);

  const [isModalPreview, setIsModalPreview] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [arqDelet, setArqDelet] = useState({});
  const [borrowersIE, setBorrowersIE] = useState('9');

  const Form = useForm({
    resolver: zodResolver(SCHEMA),
  });

  const handleCancel = () => {
    navigate('/clientes');
  };
  const { api } = useFetch();
  // @ts-ignore
  const handleRegister = async (data: RegisterProps) => {

    setIsButtonLoading(true);
    try {
      let hasError = false;

      if (
        borrowersIE === '1' &&
        !Form.getValues('inscricao_estadual_tomador')
      ) {
        hasError = true;
        Form.setError('inscricao_estadual_tomador', {
          message: 'Preencha uma Inscrição estadual do tomador válida!',
        });
      }

      let birthdate: string | Date | null = Form.getValues('birthdate') as string;

      if (birthdate) {

        //@ts-ignore
        const parts = birthdate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) || [];
        const date = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`)

        //@ts-ignore
        if (!date || isNaN(date)) {
          hasError = true;
          Form.setError('birthdate', {
            message: 'Preencha uma data válida!'
          });
          birthdate = null;
        } else {
          birthdate = date;
        }

      }

      if (hasError) {
        toast.error('Verifique as informações cadastradas!')
        setIsButtonLoading(false);
        return;
      }

      const customer = {
        ...data,
        takerIndicator: borrowersIE,
        borrowerRegistration: Form.getValues('inscricao_estadual_tomador'),
        address: {
          street: data.logradouro,
          cep: data.cep,
          city: data.cidade,
          number: data.number,
          state: data.estado,
          bairro: data.bairro,
        },
        files: [],
      };

      // @ts-ignore
      if (birthdate) customer.birthdate = birthdate.toISOString();

      if (data.cpfCnpj.length === 14) {
        customer.cpf = data.cpfCnpj;
      } else {
        customer.cnpj = data.cpfCnpj;
      }

      // Aqui regras para adicionar imagens
      let result = await Promise.all(
        //@ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        files.map(async (file: any) => {
          if (!file._id) {
            const storageRef = ref(
              storage,
              `images/${file.file?.name}${generateRandomUUID()}`,
            );

            const uploadTask = uploadBytesResumable(storageRef, file.file);

            const url = await new Promise((resolve) => {
              uploadTask.on(
                'state_changed',
                () => { },
                (error) => {
                  alert(error);
                },
                () => {
                  getDownloadURL(uploadTask.snapshot.ref).then(
                    async (downloadURL) => {
                      resolve(downloadURL);
                    },
                  );
                },
              );
            });

            return {
              url: url,
              name: file.name,
              size: file?.file.size,
              type: file?.file.type,
            };
          }
        }),
      );

      result = result.filter((f) => f && f.url);

      // Aqui se for cadastrar
      if (location.pathname.includes('cadastrar')) {
        //@ts-ignore
        customer.files = result;
        // Só vai entrar no try depois de já cadastrado, pois vai voltar com o _id
        try {
          const response = await api.post('/customers', customer);

          if (!response.data._id) throw new Error();

          toast.success('Cliente cadastrado com sucesso!');
          return navigate('/clientes');
        } catch (e) {
          const error = e as IRequestError;

          if (error?.response?.data?.UIDescription) {
            toast.error(error.response.data.UIDescription);
          } else {
            toast.error('Não foi possível cadastrar!');
          }
        }
      }

      // Aqui se for ataulizar
      if (!location.pathname.includes('cadastrar')) {
        try {
          //@ts-ignore
          customer.files = result;

          await api.put(
            `/customers/${location.pathname.split('/')[2]}`,
            customer,
          );

          toast.success('Informações atualizadas com sucesso!');
          return navigate('/clientes');
        } catch (e) {
          const error = e as IRequestError;
          if (error?.response?.data?.UIDescription) {
            toast.error(error.response.data.UIDescription); // alerta que gosta de ficar se mostrando kkkk
          } else {
            toast.error('Não foi possível atualizar as informações!');
          }
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const deleteImagemFirebase = async (
    imgURL: FileProps | unknown,
  ): Promise<void> => {
    if (!imgURL) return;
    try {
      // Obtém a referência para o arquivo usando a URL
      //@ts-ignore
      const storageRef = ref(storage, imgURL);
      // Deleta o arquivo do Firebase Storage
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
    }
  };

  const handleDelete = async (data: FileProps) => {
    // TO-DO: Validar com ifs se usuário já está cadastrado ou não e seguir com as logícas para deletar imagens locais ou remotas
    const id = data._id;
    const fileIds = [];

    const fileName: FileProps | string | undefined = data.url; // Nome do arquivo que você quer deletar no Firebase Storage

    if (fileName && fileName !== undefined) {
      deleteImagemFirebase(fileName);
    }

    try {
      if (location.pathname.split('/')[2] !== 'cadastrar') {
        const buscaApi = await api.get(
          `/ customers / ${location.pathname.split('/')[2]}`,
        );
        buscaApi.data.files.map((item: FileProps) => {
          fileIds.push(item._id); // Aqui é o id que já vai estar no banco
        });
      }

      // faz o filtro
      const filtro = files.filter((file) => file._id !== id); // aqui estou dizendo que quero retornar _id diferente do meu idzão que quero apagar
      if (id) {
        const customer = {
          files: filtro,
        };
        api
          .put(
            `/customers/${location.pathname.split('/')[2]}?deleteFiles=true`,
            customer,
          )
          .then(() => {
            toast.success('Informações atualizadas com sucesso!');
          })
          .catch((error) => {
            console.log('Erro', error);
          });
        setFiles(filtro);
      } else {
        deleteImagemFirebase(fileName);
        // setFiles(filtro)
        setFiles(
          files.filter(
            (file: FileProps) => file.file?.name !== data?.file?.name,
          ),
        );
      }
      deleteImagemFirebase(fileName);
      setIsPopupVisible(false);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    //Aqui se for editar, só serve para setar os campos
    if (!location.pathname.includes('cadastrar')) {
      (async () => {
        setIsButtonLoading(true);
        try {
          const { data } = await api.get(
            `/customers/${location.pathname.split('/')[2]}`,
          );

          if (!data._id) return;

          if (data.name) Form.setValue('name', data.name);
          if (data.fantasyname) Form.setValue('fantasyname', data.fantasyname);

          if (data.rg) Form.setValue('rg', data.rg);
          if (data.cpf || data.cnpj)
            Form.setValue(
              'cpfCnpj',
              data.cpf ? formatToCPF(data.cpf) : formatToCPF(data.cnpj),
            );
          if (data.phone) Form.setValue('phone', data.phone);
          if (data.email) Form.setValue('email', data.email);

          if (data.address) {
            const address = data.address;
            if (address.cep) Form.setValue('cep', formatToCep(address.cep));
            if (address.city) Form.setValue('cidade', address.city);
            if (address.state) Form.setValue('estado', address.state);
            if (address.street) Form.setValue('logradouro', address.street);
            if (address.bairro) Form.setValue('bairro', address.bairro);
            if (address.number) Form.setValue('number', address.number);
          }

          if (data.files) {
            setFiles(data.files);
          }
          if (data.takerIndicator) {
            setBorrowersIE(data.takerIndicator);
            //@ts-ignore
            document.getElementById(
              'indicador_inscricao_estadual_tomador',
              //@ts-ignore
            ).value = data.takerIndicator;
          }

          if (data.borrowerRegistration) {
            Form.setValue(
              'inscricao_estadual_tomador',
              data.borrowerRegistration,
            );
          }
        } catch (e) {
          console.log(e);
        } finally {
          setIsButtonLoading(false);
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (open === true) {
      //@ts-ignore
      document.querySelector('#formFileSm').click();
    }
  }, [open]);

  return (
    <>
      <title>Cadastrar Clientes | VDR Petri - Turismo e Viagens</title>
      <div>
        <Popup
          isVisible={isPopupVisible}
          onClickOutside={() => setIsPopupVisible(false)}
        >
          <div
            className="rounded-2xl border-l-8 border-red-500 bg-white p-4 shadow-lg sm:p-6 lg:p-8"
            role="alert"
          >
            <div className="flex items-center gap-4">
              <span className="shrink-0 rounded-full bg-red-500 p-2 text-white">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 64 512"
                >
                  <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V320c0 17.7 14.3 32 32 32s32-14.3 32-32V64zM32 480a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
                </svg>
              </span>

              <p className="font-medium sm:text-xl">
                Tem certeza que deseja remover esse documento?
              </p>
            </div>

            <p className="mt-4 text-gray/70">
              Tem certeza que deseja remover esse documento? Essa ação é
              irreversível e você não tera mais acesso a esse documento.
            </p>

            <div className="mt-6 sm:flex sm:gap-4">
              <button
                onClick={() => setIsPopupVisible(false)}
                className="inline-block w-full rounded-lg bg-gray/30 text-white px-5 py-3 text-center text-sm font-semibold sm:w-auto"
              >
                Cancelar
              </button>

              <button
                //@ts-ignore
                onClick={() => handleDelete(arqDelet)}
                className="inline-block w-full rounded-lg bg-red-500 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
              >
                Quero deletar esse documento
              </button>
            </div>
          </div>
        </Popup>
      </div>
      <PageWrapper>
        <div>
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-16">
            <div className="sm:flex sm:items-center sm:justify-between">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {/* Cadastrar Cliente */}
                    {location.pathname.includes('cadastrar')
                      ? 'Cadastrar Cliente'
                      : 'Atualizar Cliente'}
                  </h1>

                  <p className="mt-1.5 text-sm text-black/50">
                    {location.pathname.includes('cadastrar')
                      ? 'Aqui você pode cadastrar todas as informações sobre os seus clientes.'
                      : 'Aqui você pode atualizar todas as informações sobre os seus clientes.'}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                  <button
                    onClick={() => navigate('/notas/cadastrar')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:border-primary hover:text-primary hover:bg-primary/05"
                    type="button"
                  >
                    <span className="text-sm font-medium">Cadastrar Notas</span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => navigate('/clientes')}
                    className="block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                    type="button"
                  >
                    Lista de Clientes
                  </button>
                </div>
              </motion.div>
            </div>

            <div
              style={{ height: 0.2 }}
              className="bg-stone-300 rounded-lg my-8"
            ></div>
            <div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="flex flex-col col-span-4">
                  <label className="block text-base font-medium text-black/70">
                    Nome
                  </label>
                  <Input
                    type="text"
                    placeholder="José Carlos de Oliveira"
                    label="name"
                    form={Form}
                    schema={SCHEMA}
                  />
                </div>

                <div className="flex flex-col col-span-4">
                  <label className="block text-base font-medium text-black/70">
                    CPF ou CNPJ
                  </label>
                  <Input
                    mask="cpf/cnpj"
                    maxLength={18}
                    placeholder="000.000.000-00"
                    label="cpfCnpj"
                    form={Form}
                    schema={SCHEMA}
                  />
                </div>

                <div className="flex flex-col col-span-4">
                  <label className="block text-base font-medium text-black/70">
                    Email
                  </label>
                  <Input
                    type="text"
                    placeholder="exemplo@email.com"
                    label="email"
                    form={Form}
                    schema={SCHEMA}
                  />
                </div>

                {Form.getValues('cpfCnpj')?.length > 14 ? (
                  <>
                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Nome fantasia
                      </label>
                      <Input
                        type="text"
                        placeholder="Digite o nome fantasia"
                        label="fantasyname"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col  col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Registro Geral (RG)
                      </label>
                      <Input
                        type="text"
                        maxLength={10}
                        placeholder="00000000000"
                        label="rg"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                    <div className="flex flex-col col-span-3">
                      <label className="block text-base font-medium text-black/70">
                        Data de Nascimento
                      </label>

                      <Input
                        mask='date'
                        type="text"
                        maxLength={10}
                        placeholder="00/00/0000"
                        label="birthdate"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col col-span-3">
                  <label className="block text-base font-medium text-black/70">
                    Telefone
                  </label>
                  <Input
                    type="text"
                    placeholder="(99) 9 9999-9999"
                    label="phone"
                    mask="phone"
                    maxLength={15}
                    form={Form}
                    schema={SCHEMA}
                  />
                </div>



                <div
                  className={
                    (borrowersIE == '1' ? 'col-span-6 ' : 'col-span-12 ') +
                    'flex flex-col'
                  }
                >
                  <label className="block text-base font-medium text-black/70">
                    Indicador do papel do tomador na prestação do serviço
                  </label>
                  <Select
                    id="indicador_inscricao_estadual_tomador"
                    onChange={(e) => setBorrowersIE(e.target.value)}
                  >
                    <option value="9">Não Contribuinte</option>
                    <option value="1">Contribuinte ICMS</option>
                    <option value="2">Contribuinte isento de inscrição</option>
                  </Select>
                </div>

                {borrowersIE === '1' && (
                  <div className="flex flex-col col-span-6">
                    <label className="block text-base font-medium text-black/70">
                      Inscrição estadual do tomador
                      <small> - 14 Dígitos</small>
                    </label>
                    <Input
                      label="inscricao_estadual_tomador"
                      type="text"
                      maxLength={14}
                      placeholder="Digite a inscrição estadual do tomador"
                      form={Form}
                      schema={SCHEMA}
                    />
                  </div>
                )}
              </div>


              <p className="font-bold text-base mt-8">Informações do Endereço</p>

              <div className="grid grid-cols-12 gap-4 mt-4">

                <div className="flex flex-col col-span-3">
                  <label className="block text-base font-medium text-black/70">
                    CEP
                  </label>
                  <Input
                    type="text"
                    maxLength={8}
                    inputMode="numeric"
                    placeholder="98400-000"
                    mask="cep"
                    label="cep"
                    form={Form}
                    schema={SCHEMA}
                    onChange={async (e) => {
                      try {
                        if (e.target.value.replace(/\D/g, '').length != 8) {
                          return;
                        }

                        const adddress = await getAddressByPostalCode(
                          e.target.value,
                        );

                        if (adddress.codigo_ibge) {
                          if (adddress.uf) Form.setValue('estado', adddress.uf);
                          if (adddress.nome_localidade)
                            Form.setValue('cidade', adddress.nome_localidade);
                          if (adddress.nome_logradouro)
                            Form.setValue(
                              'logradouro',
                              adddress.nome_logradouro,
                            );
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  />
                </div>

                <div className="flex flex-col col-span-5">
                  <label className="block text-base font-medium text-black/70">
                    Logradouro
                  </label>
                  <Input
                    type="text"
                    maxLength={25}
                    inputMode="numeric"
                    placeholder="Rua dos Papagaios"
                    label="logradouro"
                    form={Form}
                    schema={SCHEMA}
                  />
                </div>

                <div className="flex flex-col col-span-4">
                  <label className="block text-base font-medium text-black/70">
                    Cidade
                  </label>
                  <Input
                    type="text"
                    maxLength={25}
                    inputMode="numeric"
                    placeholder="Frederico Westphalen"
                    label="cidade"
                    form={Form}
                    schema={SCHEMA}
                  />
                </div>

                <div className="flex flex-col col-span-3">
                  <label className="block text-base font-medium text-black/70">
                    Bairro
                    <small> - opcional</small>
                  </label>
                  <Input
                    type="text"
                    maxLength={25}
                    inputMode="text"
                    placeholder="Centro"
                    label="bairro"
                    form={Form}
                    schema={SCHEMA}
                  />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="block text-base font-medium text-black/70">
                    Estado
                  </label>
                  <Input
                    type="text"
                    maxLength={25}
                    inputMode="numeric"
                    placeholder="RS"
                    label="estado"
                    form={Form}
                    schema={SCHEMA}
                  />
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="block text-base font-medium text-black/70">
                    N° do Endereço
                  </label>
                  <Input
                    type="text"
                    maxLength={25}
                    inputMode="numeric"
                    placeholder="1234"
                    label="number"
                    form={Form}
                    schema={SCHEMA}
                  />
                </div>

              </div>

              <div className='mt-8'>
                <p className="font-bold text-base">
                  Arquivos do Cliente
                </p>

                <div
                  className='flex flex-row mt-2'
                >
                  <BasicModal
                    onSubmitUpload={(data) => {
                      if (data.file && data.name) {
                        //@ts-ignore
                        setFiles((prevState) => [...prevState, data]);
                        setOpen(false);
                      } else {
                        toast.error(
                          'Adicione um documento para enviar!',
                        );
                        setOpen(false);
                      }
                    }}
                    open={open}
                    setOpen={setOpen}
                  />
                  <input
                    type="file"
                    className="hidden"
                    id="formFileSm"
                  />
                </div>

                {files.length === 0 ? (
                  <NotFound title="Nenhum documento cadastrado!" subtitle="Nenhum arquivo foi cadastrado para esse cliente." cta={{ text: 'Adicionar', onClick: () => setOpen(true) }} />
                ) : (
                  <>
                    {files?.map((file) => (
                      <div
                        key={file.url || file?.file?.name}
                        className='flex flex-row mt-2'
                      >
                        <ImgView
                          name={file.name}
                          file={file.file}
                          url={file.url}
                          inf={file}
                          onPreview={() => {
                            setIsModalPreview(true);
                            setPreviewFile({
                              name: file.name,
                              //@ts-ignore
                              url: file.url
                                ? file.url
                                : //@ts-ignore
                                URL.createObjectURL(file.file),
                              type: file?.file ? file?.file.type : file.type,
                            });
                          }}
                          onDelete={async () => {
                            setIsPopupVisible(true);
                            setArqDelet(file);
                          }}
                        />
                      </div>
                    ))}
                    <button
                      className="mt-4 flex items-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                      type="button"
                      onClick={() => setOpen(true)}
                    >
                      Adicionar Documento
                    </button>
                  </>
                )}

                <ImgModal
                  open={isModalPreview}
                  handleClose={() => setIsModalPreview(false)}
                  name={previewFile.name}
                  url={previewFile.url}
                  type={previewFile.type}
                />
              </div>
            </div>
            <div className="footer mt-8 flex flex-row justify-between">
              <button
                disabled={isButtonLoading}
                onClick={handleCancel}
                className="flex items-center gap-3 rounded-lg bg-gray/50 px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:bg-gray/60"
                type="button"
              >
                Cancelar
              </button>

              <button
                disabled={isButtonLoading}
                onClick={
                  //@ts-ignore
                  Form.handleSubmit(handleRegister, (e) => console.log(e))
                }
                className="
                flex items-center gap-3 rounded-lg
                 bg-primary px-5 py-3 text-sm font-medium
                 text-white transition hover:scale-105
                 hover:shadow-xl focus:outline-none focus:ring"
                type="button"
              >
                {!isButtonLoading && (
                  <>
                    {!location.pathname.includes('cadastrar')
                      ? 'Atualizar'
                      : 'Cadastrar'}
                    <ArrowRightSolidSvg />
                  </>
                )}

                {isButtonLoading && (
                  <div className="px-4">
                    <Loader size={16} stroke={3} color="#fff" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </PageWrapper >
    </>
  );
};
export default RegisterClientes;
