import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Input } from '../../../../components/Input';
import { PageWrapper } from '../../../../components/PageWrapper';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select } from '../../../../components/Select';

//@ts-ignore
import { ReactComponent as ArrowRightSolidSvg } from '../../../../assets/svgs/arrow-right-solid.svg';
import './style.css';
import { BRAZIL_UFS } from '../../../../config/consts';
import { useFetch } from '../../../../hooks/useFetch';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Loader } from '../../../../components/Loader';

import { motion } from 'framer-motion';
import { capitalize } from '../../../../helpers/capitalize';

const SCHEMA = z.object({
  placa: z.string().length(7, 'Placa inválida!').nonempty('Campo obrigatório!'),
  renavam: z
    .string()
    .max(11, 'RENAVAM inválido!')
    .min(9, 'RENAVAM inválido!')
    .nonempty('Campo obrigatório!'),
  numero_registro_estadual: z
    .string()
    .min(25, 'Número de registro estadual inválido!')
    .nonempty('Campo obrigatório!'),
  name: z.string().nonempty('Campo obrigatório!'),
  manufacturingYear: z.coerce.number().min(1950, 'Valor inválido!'),
  modelYear: z.coerce.number().min(1950, 'Valor inválido!'),
  mmv: z.string().nonempty('Campo obrigatório!'),
  taf: z.string().optional(),

  color: z.string().optional(),

  // Proprietário
  cpf_cnpj: z
    .string()
    .min(14, 'Valor inválido!')
    .nonempty('Campo obrigatório!'),
  taf_proprietario: z.string().nonempty('Campo obrigatório!'),
  inscricao_estadual_proprietario: z.string().nonempty('Campo obrigatório!'),
  razao_social_proprietario: z.string().nonempty('Campo obrigatório!'),
});

type FormData = z.infer<typeof SCHEMA>;

const COLORS = [
  { valor: 'blue', color: '#0000ff', label: 'azul' },
  { valor: 'red', color: '#ff0000', label: 'vermelho' },
  { valor: 'green', color: '#077c07', label: 'verde' },
  { valor: 'yellow', color: '#8d8f0a', label: 'amarelo' },
  { valor: 'gray', color: '#9c9c9c7', label: 'cinza' },
  { valor: 'silver', color: '#7a7a7a', label: 'prata' },
  { valor: 'white', color: '#FFFFFF', label: 'branca' },
  { valor: 'orange', color: '#ec9e00', label: 'laranja' },
  { valor: 'black', color: '#000000', label: 'preto' },
  { valor: 'brown', color: '#A52A2A', label: 'marrom' },
];

export function RegisterVehicle() {
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const Form = useForm({
    resolver: zodResolver(SCHEMA),
  });

  const { api } = useFetch();

  const handleRegister = async (params: FormData) => {
    setIsButtonLoading(true);
    try {
      const request = {
        ...params,
        uf_licenciamento: (
          document.querySelector('#uf_licenciamento') as HTMLInputElement
        ).value,

        tipo_fretamento: (
          document.querySelector('#tipo_fretamento') as HTMLInputElement
        ).value,

        color: (document.querySelector('#color') as HTMLInputElement).value,

        uf_proprietario: (
          document.querySelector('#uf_proprietario') as HTMLInputElement
        ).value,

        tipo_proprietario: (
          document.querySelector('#tipo_proprietario') as HTMLInputElement
        ).value,
      };
      const vehicle = {
        name: request.name,
        manufacturingYear: request.manufacturingYear,
        modelYear: request.modelYear,
        mmv: request.mmv,
        type: request.tipo_fretamento,
        nre: request.numero_registro_estadual,
        renavam: request.renavam,
        licensePlate: request.placa,
        uf: request.uf_licenciamento,
        taf: request.taf,
        color: request.color,
        owner: {
          cpf:
            request.cpf_cnpj.replace(/\D/g, '').length == 11
              ? request.cpf_cnpj
              : undefined,
          cnpj:
            request.cpf_cnpj.replace(/\D/g, '').length == 14
              ? request.cpf_cnpj
              : undefined,
          corporateName: request.razao_social_proprietario,
          ie: request.inscricao_estadual_proprietario.replace(/\D/g, ''),
          uf: request.uf_proprietario,
          type: request.tipo_proprietario,
          taf: request.taf_proprietario,
        },
      };

      // console.log('vehicle', vehicle);

      const method = !location.pathname.includes('cadastrar') ? 'put' : 'post';
      const url = !location.pathname.includes('cadastrar')
        ? `/vehicles/${location.pathname.split('/')[2]}`
        : '/vehicles';

      const { data } = await api[method](url, vehicle);

      if (data._id) {
        const text = !location.pathname.includes('cadastrar')
          ? 'Veículo atualizado com sucesso!'
          : 'Veículo registrado com sucesso!';

        toast(text, {
          type: 'success',
          autoClose: 1500,
        });
        navigate('/veiculos');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/veiculos');
  };

  useEffect(() => {
    if (!location.pathname.includes('cadastrar')) {
      (async () => {
        setIsLoading(true);
        try {
          const { data } = await api.get(
            `/vehicles/${location.pathname.split('/')[2]}`,
          );

          // console.log('data', data);

          if (data._id) {
            if (data.nre) Form.setValue('numero_registro_estadual', data.nre);
            if (data.renavam) Form.setValue('renavam', data.renavam);
            if (data.licensePlate) Form.setValue('placa', data.licensePlate);
            if (data.mmv) Form.setValue('mmv', data.mmv);
            if (data.manufacturingYear)
              Form.setValue('manufacturingYear', data.manufacturingYear);
            if (data.modelYear) Form.setValue('modelYear', data.modelYear);
            if (data.name) Form.setValue('name', data.name);
            if (data.taf) Form.setValue('taf', data.taf);
          }

          if (data.owner) {
            const owner = data.owner;
            if (owner.cpf || owner.cnpj)
              Form.setValue('cpf_cnpj', owner.cpf || owner.cnpj);
            if (owner.corporateName)
              Form.setValue('razao_social_proprietario', owner.corporateName);
            if (owner.ie)
              Form.setValue('inscricao_estadual_proprietario', owner.ie);
            if (owner.taf) Form.setValue('taf_proprietario', owner.taf);
          }

          setTimeout(() => {
            if (data.type) {
              (
                document.querySelector('#tipo_fretamento') as HTMLInputElement
              ).value = data.type;
            }
            if (data.uf) {
              (
                document.querySelector('#uf_licenciamento') as HTMLInputElement
              ).value = data.uf;
            }
            if (data.owner) {
              const owner = data.owner;
              if (owner.uf) {
                (
                  document.querySelector('#uf_proprietario') as HTMLInputElement
                ).value = owner.uf;
              }
              if (owner.type) {
                (
                  document.querySelector(
                    '#tipo_proprietario',
                  ) as HTMLInputElement
                ).value = owner.type;
              }
            }
            if (data.color) {
              (document.querySelector('#color') as HTMLInputElement).value =
                data.color;
            }
          }, 10);
        } catch (e) {
          console.log(e);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, []);

  return (
    <>
      <title>Cadastrar Veículos | VDR Petri - Turismo e Viagens</title>
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
                    {location.pathname.includes('cadastrar')
                      ? 'Cadastrar Veículo'
                      : 'Atualizar Veículos'}
                  </h1>

                  <p className="mt-1.5 text-sm text-black/50">
                    {/* Aqui você pode cadastrar todas as informações sobre os seus
                    veículos. */}
                    {location.pathname.includes('cadastrar')
                      ? 'Aqui você pode cadastrar todas as informações sobre os seus veículos.'
                      : 'Aqui você pode atualizar todas as informações sobre os seus veículos.'}
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
                    onClick={() => navigate('/veiculos')}
                    className="block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                    type="button"
                  >
                    Lista de Veículos
                  </button>
                </div>
              </motion.div>
            </div>

            <div
              style={{ height: 0.2 }}
              className="bg-stone-300 rounded-lg my-8"
            ></div>

            {isLoading && (
              <div className="w-full flex items-center justify-center mt-16">
                <Loader />
              </div>
            )}

            {!isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div>
                  <p className="font-bold text-base">Informações do Veículo</p>

                  <div className="grid grid-cols-12 gap-4 mt-4">
                    <div className="flex flex-col col-span-3">
                      <label className="block text-base font-medium text-black/70">
                        Nome do veículo
                      </label>
                      <Input
                        type="text"
                        placeholder="Digite o nome do veículo"
                        label="name"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                    <div className="flex flex-col col-span-3">
                      <label className="block text-base font-medium text-black/70">
                        Placa
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: BRA2E19"
                        label="placa"
                        form={Form}
                        schema={SCHEMA}
                        maxLength={7}
                        onInput={(e) =>
                          Form.setValue(
                            'placa',
                            (
                              (e.target as HTMLInputElement).value || ''
                            ).toUpperCase(),
                          )
                        }
                      />
                    </div>

                    <div className="flex flex-col  col-span-6">
                      <label className="block text-base font-medium text-black/70">
                        Número do RENAVAM
                      </label>
                      <Input
                        type="text"
                        maxLength={11}
                        placeholder="Ex: 54036532176"
                        label="renavam"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>

                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Marca / Modelo / Versão
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: SCANIA/MPOLO PARADISO DD"
                        label="mmv"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>

                    <div className="flex flex-col  col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Cor do veículo
                        <small> - A cor que aparecerá no calendário</small>
                      </label>
                      <Select id="color">
                        <option value={''}>Selecione</option>
                        {COLORS.map((item) => (
                          <option key={item.valor} value={item.color}>
                            {capitalize(item.label)}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="flex flex-col col-span-2">
                      <label className="block text-base font-medium text-black/70">
                        Ano de Fabricação
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: 2017"
                        label="manufacturingYear"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                    <div className="flex flex-col col-span-2">
                      <label className="block text-base font-medium text-black/70">
                        Ano Modelo
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: 2018"
                        label="modelYear"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>

                    <div className="flex flex-col col-span-12">
                      <label className="block text-base font-medium text-black/70">
                        Número de Registro Estadual <small> - 25 Dígitos</small>
                      </label>
                      <Input
                        type="text"
                        maxLength={25}
                        inputMode="numeric"
                        placeholder="Digite o número de registro estadual"
                        label="numero_registro_estadual"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                    <div className="flex flex-col col-span-12">
                      <label className="block text-base font-medium text-black/70">
                        TAF{' '}
                        <small>
                          {' '}
                          - obrigatório caso o veículo faça rota interestadual
                        </small>
                      </label>
                      <Input
                        type="text"
                        maxLength={25}
                        inputMode="numeric"
                        placeholder="Digite o TAF"
                        label="taf"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                    <div className="flex flex-col  col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Em qual UF o veículo está licenciado?
                      </label>
                      <Select id="uf_licenciamento">
                        {BRAZIL_UFS.map((uf) => (
                          <option key={uf} value={uf.split('-')[0].trim()}>
                            {uf}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col col-span-3">
                      <label className="block text-base font-medium text-black/70">
                        Tipo de Fretamento
                      </label>
                      <Select id="tipo_fretamento">
                        <option value="2">Contínuo</option>
                        <option value="1">Eventual</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="font-bold text-base">
                    Informações do Proprietário
                  </p>

                  <div className="grid grid-cols-12 gap-4 mt-4">
                    <div className="flex flex-col  col-span-5">
                      <label
                        htmlFor="email"
                        className="block text-base font-medium text-black/70"
                      >
                        CPF ou CNPJ
                      </label>
                      <Input
                        type="text"
                        mask="cpf/cnpj"
                        maxLength={18}
                        placeholder="Ex: 034.307.094-99"
                        label="cpf_cnpj"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                    <div className="flex flex-col  col-span-4">
                      <label
                        htmlFor="email"
                        className="block text-base font-medium text-black/70"
                      >
                        Inscrição Estadual do Proprietário
                      </label>
                      <Input
                        label="inscricao_estadual_proprietario"
                        type="text"
                        placeholder="Digite a inscrição estadual do proprietário"
                        maxLength={14}
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                    <div className="flex flex-col  col-span-3">
                      <label
                        htmlFor="email"
                        className="block text-base font-medium text-black/70"
                      >
                        TAF do Proprietário
                      </label>
                      <Input
                        label="taf_proprietario"
                        type="text"
                        maxLength={12}
                        placeholder="Digite o TAF do proprietário"
                        form={Form}
                        schema={SCHEMA}
                      />
                    </div>
                    <div className="flex flex-col  col-span-6">
                      <label className="block text-base font-medium text-black/70">
                        Razão social do proprietário
                      </label>
                      <Input
                        label="razao_social_proprietario"
                        type="text"
                        form={Form}
                        schema={SCHEMA}
                        placeholder="Digite a razão social do proprietário"
                      />
                    </div>
                    <div className="flex flex-col  col-span-3">
                      <label className="block text-base font-medium text-black/70">
                        UF do Proprietário
                      </label>
                      <Select id="uf_proprietario">
                        {BRAZIL_UFS.map((uf) => (
                          <option key={uf} value={uf.split('-')[0].trim()}>
                            {uf}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col  col-span-3">
                      <label className="block text-base font-medium text-black/70">
                        Tipo do Proprietário
                      </label>
                      <Select id="tipo_proprietario">
                        <option value="0">TAC - Agregado</option>
                        <option value="1">TAC - Independente</option>
                        <option value="2">Outros</option>
                      </Select>
                    </div>
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
                    className="flex items-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
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
              </motion.div>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
