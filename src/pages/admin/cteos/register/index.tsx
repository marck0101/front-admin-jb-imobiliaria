/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../../components/Input';
import { PageWrapper } from '../../../../components/PageWrapper';
//@ts-ignore
import { ReactComponent as ArrowRightSolidSvg } from '../../../../assets/svgs/arrow-right-solid.svg';
//@ts-ignore
import { ReactComponent as CircleCheckSolidSvg } from '../../../../assets/svgs/circle-check-solid.svg';
import { Select } from '../../../../components/Select';
import { BRAZIL_UFS } from '../../../../config/consts';
import { useFetch } from '../../../../hooks/useFetch';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Loader } from '../../../../components/Loader';
import { IVehicle } from '../../../../@types/vehicle';
import { IAddress } from '../../../../@types/address';
import { getAddressByPostalCode } from '../../../../helpers/get-address-by-postal-code';
import { ScreenLoading } from '../../../../components/ScreenLoading';
import { Popup } from '../../../../components/Popup';
import { IForm } from '../../../../@types/form';
import { getCFOPByCode } from '../../../../helpers/get-cfop-by-code';
import { makeRouteBetweenUFs } from '../../../../helpers/make-route-between-ufs';
import { getDataByCnpj } from '../../../../helpers/get-data-by-cnpj';
import BusaClientes from './BuscaClientes';
import { formatToCPF } from '../../../../helpers/format-to-cpf';
import { CustomersSelect } from '../../../../components/CustomersSelect';
// import { formatToCep } from "../../../../helpers/format-to-cep";

const SCHEMAS = {
  '1': z.object({
    cfop: z.string().length(4, 'CFOP inválido!').nonempty('Campo obrigatório!'),
    valor_total: z.string().nonempty('Campo obrigatório!'),
    valor_receber: z.string().nonempty('Campo obrigatório!'),
    natureza_operacao: z.string().nonempty('Campo obrigatório!'),
    descricao_servico: z.string().default('Transporte de Passageiros'),
  }),
  '2': z.object({
    observacoes: z.string().nonempty('Campo obrigatório!'),
    nome_seguradora: z.string().optional(),
    numero_apolice: z.string().optional(),
  }),
  '3': z.object({
    cpf_cnpj_tomador: z.string().nonempty('Campo obrigatório!'),
    nome_tomador: z.string().nonempty('Campo obrigatório!'),
    numero_tomador: z.string().nonempty('Campo obrigatório!'),
    cep_tomador: z.string().nonempty('Campo obrigatório!'),
    nome_fantasia_tomador: z.string().nonempty('Campo obrigatório!'),
    email_tomador: z
      .string()
      .email('E-mail inválido!')
      .nonempty('Campo obrigatório!'),
    telefone_tomador: z.string().nonempty('Campo obrigatório!'),
    municipio_tomador: z.string().nonempty('Campo obrigatório!'),
    logradouro_tomador: z.string().nonempty('Campo obrigatório!'),
    bairro_tomador: z.string().nonempty('Campo obrigatório!'),
    uf_tomador: z.string().nonempty('Campo obrigatório!'),
    inscricao_estadual_tomador: z.string().optional(),
  }),
};

export function RegisterCteos() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCFOPLoading, setIsCFOPLoading] = useState(false);

  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fantasyname, setFantasyname] = useState(false);
  const [isGoingAbroad, setIsGoingAbroad] = useState(false);
  const [borrowersIE, setBorrowersIE] = useState('9');
  const [needRoute, setNeedRoute] = useState(false);
  const [route, setRoute] = useState(['RS'] as Array<string>);

  const FirstForm = useForm({ resolver: zodResolver(SCHEMAS['1']) });
  const SecondForm = useForm({ resolver: zodResolver(SCHEMAS['2']) });
  const ThirtyForm = useForm({ resolver: zodResolver(SCHEMAS['3']) });

  const { api } = useFetch();

  const [initAddress, setInitAddress] = useState<null | IAddress>(null);
  const [endAddress, setEndAddress] = useState<null | IAddress>(null);
  const [customerAddress, setCustomerAddress] =
    useState<null | Partial<IAddress>>(null);

  const [form, setForm] = useState({});

  const [vehicles, setVehicles] = useState([] as Array<IVehicle>);

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data.data);

      if (!data.data || !data.data.length) {
        setIsPopupVisible(true);
      }
    } catch (e) {
      console.log(e);
      setVehicles([]);
      setIsPopupVisible(true);
    }
  };

  const handleRegister = async () => {
    let data = {};

    if (step == 1) {
      const hasError = await new Promise((resolve) =>
        FirstForm.handleSubmit(
          () => resolve(false),
          () => resolve(true),
        )(),
      );

      const first: IForm.FirstStep = {
        cfop: FirstForm.getValues('cfop'),
        valor_total: Number(
          FirstForm.getValues('valor_total').replace(/\D/g, '') / 100,
        ),
        valor_receber: Number(
          FirstForm.getValues('valor_receber').replace(/\D/g, '') / 100,
        ),
        natureza_operacao: FirstForm.getValues('natureza_operacao').slice(
          0,
          60,
        ),
        descricao_servico: (
          document.querySelector('#tipo_servico') as HTMLSelectElement
        ).options[
          (document.querySelector('#tipo_servico') as HTMLSelectElement)
            .selectedIndex
        ].text,
        tipo_servico: (
          document.querySelector('#tipo_servico') as HTMLInputElement
        ).value as IForm.TipoServico,
      };

      data = { ...data, ...first };
      setForm({ ...form, ...data });

      if (hasError) return;
    }

    if (step == 2) {
      let hasError = await new Promise((resolve) =>
        SecondForm.handleSubmit(
          () => resolve(false),
          () => resolve(true),
        )(),
      );

      if (!initAddress?.codigo_ibge) {
        hasError = true;
        SecondForm.setError('cep_inicio', {
          message: 'Preencha um CEP válido!',
        });
      }

      if (!endAddress?.codigo_ibge && !isGoingAbroad) {
        hasError = true;
        SecondForm.setError('cep_fim', { message: 'Preencha um CEP válido!' });
      }

      if (
        !initAddress?.codigo_ibge ||
        (!endAddress?.codigo_ibge && !isGoingAbroad)
      ) {
        return;
      }

      if (isGoingAbroad && !SecondForm.getValues('cep_fim')) {
        hasError = true;
        SecondForm.setError('cep_fim', { message: 'Campo obrigatório!' });
      }

      const second: Partial<IForm.SecondStep> = {
        codigo_municipio_fim: endAddress?.codigo_ibge,
        codigo_municipio_inicio: initAddress?.codigo_ibge,
        municipio_fim: endAddress?.nome_localidade,
        municipio_inicio: initAddress?.nome_localidade,
        uf_fim: endAddress?.uf,
        uf_inicio: initAddress?.uf,
        modal_rodoviario: (
          document.querySelector('#vehicle') as HTMLInputElement
        ).value,
        observacoes: SecondForm.getValues('observacoes').trim(),
      };

      if (isGoingAbroad) {
        second.codigo_municipio_fim = '9999999';
        second.municipio_fim = SecondForm.getValues('cep_fim');
        second.uf_fim = 'EX';
      }

      //@ts-ignore
      delete data.percursos;
      //@ts-ignore
      delete data.seguros_carga;

      if (!isGoingAbroad) {
        second.percursos = route.map((r) => ({ uf_percurso_veiculo: r }));
        second.percursos.splice(0, 1);
        second.percursos.splice(second.percursos.length - 1, 1);
      }

      const seguros_carga = [
        {
          responsavel_seguro: (
            document.querySelector('#responsavel_seguro') as HTMLInputElement
          ).value,
          nome_seguradora: SecondForm.getValues('nome_seguradora'),
          numero_apolice: SecondForm.getValues('numero_apolice'),
        },
      ];

      if (seguros_carga[0].nome_seguradora && seguros_carga[0].numero_apolice) {
        second.seguros_carga = seguros_carga;
      }

      data = { ...data, ...second };
      setForm({ ...form, ...data });

      if (hasError) return;
    }

    if (step == 3) {
      let hasError = await new Promise((resolve) =>
        ThirtyForm.handleSubmit(
          () => resolve(false),
          () => resolve(true),
        )(),
      );

      if (!customerAddress?.nome_localidade) {
        hasError = true;
        ThirtyForm.setError('cep_tomador', {
          message: 'Preencha um CEP válido!',
        });
      }
      const thirdy: Partial<IForm.ThirdyStep> = {
        codigo_municipio_tomador: customerAddress?.codigo_ibge,
        cep_tomador: ThirtyForm.getValues('cep_tomador'),
        bairro_tomador: ThirtyForm.getValues('bairro_tomador'),
        logradouro_tomador: ThirtyForm.getValues('logradouro_tomador'),
        municipio_tomador: ThirtyForm.getValues('municipio_tomador'),
        uf_tomador: ThirtyForm.getValues('uf_tomador'),

        numero_tomador: ThirtyForm.getValues('numero_tomador'),
        nome_tomador: ThirtyForm.getValues('nome_tomador'),
        nome_fantasia_tomador: ThirtyForm.getValues('nome_fantasia_tomador'),
        email_tomador: ThirtyForm.getValues('email_tomador'),
        pais_tomador: 'Brasil',
        telefone_tomador: ThirtyForm.getValues('telefone_tomador'),
        indicador_inscricao_estadual_tomador: (
          document.querySelector(
            '#indicador_inscricao_estadual_tomador',
          ) as HTMLInputElement
        ).value as IForm.IndicadorInscricaoEstadualTomador,
        inscricao_estadual_tomador: ThirtyForm.getValues(
          'inscricao_estadual_tomador',
        ),
      };

      data = { ...data, ...thirdy };

      if (thirdy.indicador_inscricao_estadual_tomador == '1') {
        //@ts-ignore
        data.inscricao_estadual_tomador = //@ts-ignore
          data?.inscricao_estadual_tomador.replace(/\D/g, '');
      }

      if (thirdy.indicador_inscricao_estadual_tomador == '2') {
        //@ts-ignore
        data.inscricao_estadual_tomador = 'ISENTO';
      }

      if (thirdy.indicador_inscricao_estadual_tomador == '9') {
        //@ts-ignore
        delete data.inscricao_estadual_tomador;
      }

      if (
        ThirtyForm.getValues('cpf_cnpj_tomador').replace(/\D/g, '').length == 14
      ) {
        //@ts-ignore
        data.cnpj_tomador = ThirtyForm.getValues('cpf_cnpj_tomador');
        //@ts-ignore
        delete data.cpf_tomador;
      } else {
        //@ts-ignore
        data.cpf_tomador = ThirtyForm.getValues('cpf_cnpj_tomador');
        //@ts-ignore
        delete data.cnpj_tomador;
      }

      setForm({ ...form, ...data });

      if (hasError) return;
    }

    if (step != 3) {
      return setStep(step + 1);
    }

    setIsLoading(true);
    try {
      const response = await api.post('/cteos', { ...form, ...data });

      if (response.data.status == 'erro_autorizacao') {
        toast(
          response.data.mensagem_sefaz.includes(':')
            ? response.data.mensagem_sefaz.split(':')[1]
            : response.data.mensagem_sefaz,
          {
            type: 'error',
            autoClose: 1500,
          },
        );
        setIsLoading(false);
        return;
      }

      if (
        response.data.status == 'autorizado' ||
        response.data.status == 'processando_autorizacao'
      ) {
        setIsLoading(false);
        toast(response.data.mensagem_sefaz, {
          type: 'success',
          autoClose: 1500,
        });
        return navigate('/notas');
      }

      throw new Error();
    } catch (e) {
      console.log('e', e);
      toast('Não foi possível emitir sua nota!', {
        type: 'error',
        autoClose: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (step == 1) return navigate('/notas');
    setStep(step - 1);
  };

  const handleFetchCFOP = async (value: string) => {
    setIsCFOPLoading(true);
    try {
      const cfop = await getCFOPByCode(value);
      if (!cfop.descricao) throw new Error();

      FirstForm.setValue(
        'natureza_operacao',
        cfop.descricao.replace(`${value} - `, '').slice(0, 60),
      );
      FirstForm.clearErrors('cfop');
      FirstForm.clearErrors('natureza_operacao');
    } catch (e) {
      if (!FirstForm.getFieldState('natureza_operacao').isTouched) {
        FirstForm.setValue('natureza_operacao', '');
      }
    } finally {
      setIsCFOPLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (customerAddress?.bairro)
      ThirtyForm.setValue('bairro_tomador', customerAddress.bairro);
    if (customerAddress?.nome_localidade)
      ThirtyForm.setValue('municipio_tomador', customerAddress.nome_localidade);
    if (customerAddress?.nome_logradouro)
      ThirtyForm.setValue(
        'logradouro_tomador',
        customerAddress.nome_logradouro,
      );
    if (customerAddress?.uf)
      ThirtyForm.setValue('uf_tomador', customerAddress.uf);
  }, [customerAddress]);

  useEffect(() => {
    if (initAddress?.codigo_ibge && endAddress?.codigo_ibge) {
      try {
        //@ts-ignore
        const route = makeRouteBetweenUFs(initAddress.uf, endAddress.uf);
        if (route && route.length > 2) {
          setNeedRoute(true);
          setRoute(route);
        } else {
          throw new Error();
        }
      } catch (e) {
        setNeedRoute(false);
        setRoute([]);
      }
    }
  }, [initAddress, endAddress]);

  async function handleGetClient(data: any) {

    setCustomerAddress({});
    ThirtyForm.setValue('cpf_cnpj_tomador', '');
    ThirtyForm.setValue('telefone_tomador', '');
    ThirtyForm.setValue('nome_fantasia_tomador', '');
    ThirtyForm.setValue('email_tomador', '');
    ThirtyForm.setValue('nome_tomador', '');
    ThirtyForm.setValue('cep_tomador', '');
    ThirtyForm.setValue('logradouro_tomador', '');
    ThirtyForm.setValue('numero_tomador', '');


    if (data._id) {
      if (data.cpf || data.cnpj)
        ThirtyForm.setValue(
          'cpf_cnpj_tomador',
          data.cpf ? formatToCPF(data.cpf) : formatToCPF(data.cnpj),
        );
      if (data.phone)
        ThirtyForm.setValue('telefone_tomador', data.phone ? data.phone : '');
      if (data.fantasyname)
        ThirtyForm.setValue(
          'nome_fantasia_tomador',
          data.fantasyname ? data.fantasyname : '',
        );
      if (data.email)
        ThirtyForm.setValue('email_tomador', data.email ? data.email : '');
      if (data.name)
        ThirtyForm.setValue('nome_tomador', data.name ? data.name : '');
      if (data.address.cep)
        ThirtyForm.setValue(
          'cep_tomador',
          data.address.cep ? data.address.cep : '',
        );

      const address = await getAddressByPostalCode(data.address.cep);

      setCustomerAddress({
        codigo_ibge: address.codigo_ibge,
        bairro: data.address.bairro,
        uf: data.address.state,
        nome_localidade: data.address.city,
        cep: data.address.cep,
        nome_logradouro: data.address.street,
      });
      if (data.address.street)
        ThirtyForm.setValue(
          'logradouro_tomador',
          data.address.street ? data.address.street : '',
        );
      if (data.address.number)
        ThirtyForm.setValue(
          'numero_tomador',
          data.address.number ? data.address.number : '',
        );
    }

    if (data.cnpj) {
      setFantasyname(true);
    } else {
      setFantasyname(false);
    }
  }

  return (
    <>
      <title>Cadastrar Nota | VDR Petri - Turismo e Viagens</title>
      <PageWrapper>
        <div>
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-16">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  Cadastrar Notas
                </h1>

                <p className="mt-1.5 text-sm text-black/50">
                  Aqui você pode cadastrar todas as informações sobre suas
                  notas.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                <button
                  onClick={() => navigate('/veiculos')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:border-primary hover:text-primary hover:bg-primary/05"
                  type="button"
                >
                  <span className="text-sm font-medium">Veículos</span>

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
                  onClick={() => navigate('/notas')}
                  className="block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                  type="button"
                >
                  Lista de Notas
                </button>
              </div>
            </div>

            <div
              style={{ height: 0.2 }}
              className="bg-stone-300 rounded-lg my-8"
            ></div>

            <div>
              {step == 1 && (
                <div>
                  <p className="font-bold text-base">Informações do Serviço</p>

                  <div className="grid grid-cols-12 gap-4 mt-4">
                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        CFOP
                        <small> - 4 Dígitos</small>
                      </label>
                      <Input
                        maxLength={4}
                        type="text"
                        placeholder="Ex: 5357"
                        onChange={async (e) => {
                          if (e.target.value.length == 4) {
                            handleFetchCFOP(e.target.value);
                          }
                        }}
                        label="cfop"
                        form={FirstForm}
                        schema={SCHEMAS['1']}
                      />
                    </div>

                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Qual o valor total do serviço?
                      </label>
                      <Input
                        mask="money"
                        label="valor_total"
                        type="text"
                        onChange={(e) => {
                          if (
                            !FirstForm.getFieldState('valor_receber').isTouched
                          ) {
                            FirstForm.setValue('valor_receber', e.target.value);
                          }
                        }}
                        placeholder="Ex: R$5.600,00"
                        form={FirstForm}
                        schema={SCHEMAS['1']}
                      />
                    </div>
                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Qual o valor a receber do serviço?
                      </label>
                      <Input
                        mask="money"
                        label="valor_receber"
                        type="text"
                        placeholder="Ex: R$5.240,00"
                        form={FirstForm}
                        schema={SCHEMAS['1']}
                      />
                    </div>

                    <div className="flex flex-col col-span-8">
                      <label className="block text-base font-medium text-black/70">
                        Descrição da natureza de operação
                      </label>
                      <Input
                        label="natureza_operacao"
                        type="text"
                        maxLength={60}
                        placeholder="Digite a descrição da natureza de operação"
                        form={FirstForm}
                        isLoading={isCFOPLoading}
                        schema={SCHEMAS['1']}
                      />
                    </div>
                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Qual o tipo de serviço prestado?
                      </label>
                      <Select id="tipo_servico">
                        <option value="6">Transporte de Pessoas</option>
                        <option value="7">Transporte de Valores</option>
                        <option value="8">Transporte de Bagagem</option>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              {step == 2 && (
                <div>
                  <p className="font-bold text-base">Informações da Viagem</p>

                  {isGoingAbroad && (
                    <button
                      onClick={() => {
                        setIsGoingAbroad(false);
                        SecondForm.setValue('cep_fim', '');
                        setEndAddress(null);
                      }}
                      className="w-full mt-4 flex flex-row items-center gap-3 shadow-sm transition duration-200 bg-white px-4 py-4 rounded-lg text-primary border border-primary "
                    >
                      <CircleCheckSolidSvg />
                      <p className="font-medium">
                        Essa viagem é para o exterior
                      </p>
                    </button>
                  )}

                  {!isGoingAbroad && (
                    <button
                      onClick={() => {
                        setIsGoingAbroad(true);
                        SecondForm.setValue('cep_fim', '');
                        setEndAddress(null);
                      }}
                      className="w-full mt-4 flex flex-row items-center gap-3 text-slate-400 transition duration-200 shadow-sm border border-slate-300 px-4 py-4 rounded-lg "
                    >
                      <div className="border-2 border-slate-300 rounded-full h-4 w-4"></div>
                      <p className="font-normal">
                        Essa viagem é para o exterior
                      </p>
                    </button>
                  )}

                  <div className="grid grid-cols-12 gap-4 mt-4">
                    <div className="flex flex-col col-span-6">
                      <label className="block text-base font-medium text-black/70">
                        CEP de ínicio da viagem
                      </label>
                      <Input
                        mask="cep"
                        onChange={async (e) => {
                          try {
                            setInitAddress(null);
                            if (e.target.value.replace(/\D/g, '').length == 8) {
                              const adddress = await getAddressByPostalCode(
                                e.target.value,
                              );
                              if (adddress.codigo_ibge) {
                                SecondForm.clearErrors('cep_inicio');
                                setInitAddress(adddress);
                              }
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        label="cep_inicio"
                        type="text"
                        maxLength={9}
                        placeholder="Ex: 98900-000"
                        form={SecondForm}
                      />
                    </div>

                    {!isGoingAbroad && (
                      <>
                        <div className="flex flex-col col-span-6">
                          <label className="block text-base font-medium text-black/70">
                            CEP de fim da viagem
                          </label>
                          <Input
                            mask="cep"
                            onChange={async (e) => {
                              try {
                                setEndAddress(null);
                                if (
                                  e.target.value.replace(/\D/g, '').length == 8
                                ) {
                                  const adddress = await getAddressByPostalCode(
                                    e.target.value,
                                  );
                                  if (adddress.codigo_ibge) {
                                    SecondForm.clearErrors('cep_fim');
                                    setEndAddress(adddress);
                                  }
                                }
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            label="cep_fim"
                            type="text"
                            maxLength={9}
                            placeholder="Ex: 98900-000"
                            form={SecondForm}
                            schema={SCHEMAS['2']}
                          />
                        </div>
                      </>
                    )}
                    {isGoingAbroad && (
                      <>
                        <div className="flex flex-col col-span-6">
                          <label className="block text-base font-medium text-black/70">
                            País/Cidade de fim da viagem
                          </label>
                          <Input
                            label="cep_fim"
                            type="text"
                            placeholder="Ex: ARG/Buenos Aires"
                            form={SecondForm}
                            schema={SCHEMAS['2']}
                          />
                        </div>
                      </>
                    )}
                    {!isGoingAbroad && needRoute && (
                      <div className="flex flex-col col-span-12">
                        <label className="block text-base font-medium text-black/70">
                          Percurso da viagem
                        </label>
                        <p className="text-gray/70 text-sm">
                          O percurso é obrigatório pois sua viagem percorre UF's
                          que não fazem fronteira.
                        </p>

                        <div className="flex flex-row gap-2">
                          {route.map((route) => (
                            <button
                              key={route}
                              onClick={() => {
                                setRoute((prevState) =>
                                  prevState.filter((uf) => uf != route),
                                );
                              }}
                              className="group relative overflow-hidden inline-flex items-center cursor-pointer w-fit mt-4  gap-3 shadow-sm transition duration-200 bg-white px-3 py-2 rounded-lg text-slate-500 border border-slate-300 "
                            >
                              <span className="text-sm font-medium transition-all group-hover:ms-5">
                                {route}
                              </span>
                              <span className="absolute -start-full transition-all group-hover:start-3">
                                <svg
                                  className="h-3 w-3 rtl:rotate-180 "
                                  stroke="currentColor"
                                  fill="currentColor"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 448 512"
                                >
                                  <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                                </svg>
                              </span>
                            </button>
                          ))}

                          <div className="flex flex-row items-center cursor-pointer w-fit mt-4  gap-1 shadow-sm transition duration-200 bg-white px-1 rounded-lg text-slate-500 border border-slate-300 ">
                            <select
                              onChange={(e) => {
                                setRoute((prevState) => [
                                  ...prevState,
                                  e.target.value,
                                ]);
                                setTimeout(() => {
                                  e.target.value = 'DEFAULT';
                                }, 10);
                              }}
                              className="bg-transparent"
                            >
                              <option value="DEFAULT">UF</option>
                              {BRAZIL_UFS.map((uf) => (
                                <option key={uf} value={uf.split(' - ')[0]}>
                                  {uf.split(' - ')[0]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {!route ||
                          (!route.length &&
                            initAddress?.uf &&
                            endAddress?.uf && (
                              <button
                                onClick={() => {
                                  if (initAddress?.uf && endAddress?.uf) {
                                    //@ts-ignore
                                    setRoute(
                                      //@ts-ignore
                                      makeRouteBetweenUFs(
                                        //@ts-ignore
                                        initAddress?.uf,
                                        endAddress?.uf,
                                      ),
                                    );
                                  }
                                }}
                                className="flex flex-row items-center cursor-pointer w-fit mt-4  gap-2 shadow-sm transition duration-200 bg-white px-3 py-2 rounded-lg text-slate-500 border border-slate-300 "
                              >
                                <svg
                                  className="h-4 w-4 rtl:rotate-180 "
                                  stroke="currentColor"
                                  fill="currentColor"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 576 512"
                                >
                                  <path d="M565.6 36.2C572.1 40.7 576 48.1 576 56V392c0 10-6.2 18.9-15.5 22.4l-168 64c-5.2 2-10.9 2.1-16.1 .3L192.5 417.5l-160 61c-7.4 2.8-15.7 1.8-22.2-2.7S0 463.9 0 456V120c0-10 6.1-18.9 15.5-22.4l168-64c5.2-2 10.9-2.1 16.1-.3L383.5 94.5l160-61c7.4-2.8 15.7-1.8 22.2 2.7zM48 136.5V421.2l120-45.7V90.8L48 136.5zM360 422.7V137.3l-144-48V374.7l144 48zm48-1.5l120-45.7V90.8L408 136.5V421.2z" />
                                </svg>
                                <span className="text-sm font-medium transition-all">
                                  Gerar novamente
                                </span>
                              </button>
                            ))}
                      </div>
                    )}

                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Selecione o veículo utilizado
                      </label>
                      <Select id="vehicle">
                        {vehicles.map((vehicle) => (
                          <option key={vehicle._id} value={vehicle._id}>
                            {vehicle.name} - {vehicle.licensePlate}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="flex flex-col col-span-12">
                      <label className="block text-base font-medium text-black/70">
                        Observações
                      </label>
                      <Input
                        pattern="[!-ÿ]{1}[ -ÿ]{0,}[!-ÿ]{1}|[!-ÿ]{1}"
                        label="observacoes"
                        type="text"
                        placeholder="Ex: Saída dia 06/09/2023 as 18:00 e retorno dia 10/09/2023 as 17:00"
                        form={SecondForm}
                        schema={SCHEMAS['2']}
                      />
                    </div>

                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Responsável pelo Seguro <small> - opcional</small>
                      </label>
                      <Select id="responsavel_seguro">
                        <option value="5">Tomador de Serviço</option>
                        <option value="4">Emitente do CT-e</option>
                      </Select>
                    </div>
                    <div className="flex flex-col col-span-3">
                      <label className="block text-base font-medium text-black/70">
                        Nome da Seguradora <small> - opcional</small>
                      </label>
                      <Input
                        label="nome_seguradora"
                        type="text"
                        placeholder="Digite o nome da seguradora"
                        form={SecondForm}
                        schema={SCHEMAS['2']}
                      />
                    </div>
                    <div className="flex flex-col col-span-5">
                      <label className="block text-base font-medium text-black/70">
                        Número da Apólice <small> - opcional</small>
                      </label>
                      <Input
                        label="numero_apolice"
                        type="text"
                        placeholder="Digite o número da apólice"
                        form={SecondForm}
                        schema={SCHEMAS['2']}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step == 3 && (
                <div>

                  <CustomersSelect
                    onSelect={(customer) => {
                      handleGetClient(customer);
                      ThirtyForm.handleSubmit(() => { }, () => { })();
                    }}
                  />

                  <p className="font-bold text-base mt-6">Informações do Tomador</p>

                  <div className="grid grid-cols-12 gap-4 mt-4">
                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        CPF ou CNPJ do tomador
                      </label>
                      <Input
                        mask="cpf/cnpj"
                        label="cpf_cnpj_tomador"
                        type="text"
                        placeholder="Ex: 17.521.375/0001-08"
                        maxLength={18}
                        form={ThirtyForm}
                        schema={SCHEMAS['3']}
                        onChange={async (e) => {
                          try {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length != 11 && value.length != 14) {
                              return;
                            }

                            const data = await getDataByCnpj(value);

                            if (data.razao_social) {
                              ThirtyForm.setValue(
                                'nome_tomador',
                                data.razao_social.slice(0, 60),
                              );
                            }

                            if (!data || !data.endereco) return;

                            if (data.endereco.numero) {
                              ThirtyForm.setValue(
                                'numero_tomador',
                                data.endereco.numero,
                              );
                            }

                            if (data.endereco.cep) {
                              ThirtyForm.setValue(
                                'cep_tomador',
                                data.endereco.cep,
                              );

                              const adddress = await getAddressByPostalCode(
                                data.endereco.cep,
                              );
                              if (adddress.codigo_ibge) {
                                ThirtyForm.clearErrors('cep_tomador');
                                setCustomerAddress(adddress);
                                // console.log('address', adddress)
                              }
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col col-span-3">
                      <label className="block text-base font-medium text-black/70">
                        Qual o telefone do tomador?
                      </label>
                      <Input
                        mask="phone"
                        label="telefone_tomador"
                        type="text"
                        placeholder="Ex: (55) 99999-9999"
                        form={ThirtyForm}
                        schema={SCHEMAS['3']}
                      />
                    </div>
                    <div className="flex flex-col col-span-5">
                      <label className="block text-base font-medium text-black/70">
                        Qual o e-mail do tomador?
                      </label>
                      <Input
                        //@ts-ignore
                        onInput={(e) =>
                          ThirtyForm.setValue(
                            'email_tomador',
                            //@ts-ignore
                            e.target.value.toLowerCase(),
                          )
                        }
                        label="email_tomador"
                        type="text"
                        placeholder="Ex: exemplo@gmail.com"
                        form={ThirtyForm}
                        schema={SCHEMAS['3']}
                      />
                    </div>
                    <div className="flex flex-col col-span-6">
                      <label className="block text-base font-medium text-black/70">
                        Qual o nome do tomador?
                      </label>
                      <Input
                        label="nome_tomador"
                        type="text"
                        maxLength={60}
                        placeholder="Digite o nome do tomador"
                        form={ThirtyForm}
                        schema={SCHEMAS['3']}
                      />
                    </div>

                    <div className="flex flex-col col-span-6">
                      <label className="block text-base font-medium text-black/70">
                        Qual o nome fantasia do tomador?
                      </label>
                      <Input
                        label="nome_fantasia_tomador"
                        type="text"
                        placeholder="Digite o nome fantasia do tomador"
                        form={ThirtyForm}
                        schema={SCHEMAS['3']}
                      />
                    </div>

                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Qual o CEP do tomador?
                      </label>
                      <Input
                        mask="cep"
                        onChange={async (e) => {
                          try {
                            setCustomerAddress(null);
                            if (e.target.value.replace(/\D/g, '').length != 8) {
                              return;
                            }

                            const adddress = await getAddressByPostalCode(
                              e.target.value,
                            );
                            if (adddress.codigo_ibge) {
                              ThirtyForm.clearErrors('cep_tomador');
                              setCustomerAddress(adddress);
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        label="cep_tomador"
                        type="text"
                        maxLength={9}
                        placeholder="Ex: 98900-000"
                        form={ThirtyForm}
                      />
                    </div>
                    <div className="flex flex-col col-span-4">
                      <label className="block text-base font-medium text-black/70">
                        Nº do endereço do tomador?
                      </label>
                      <Input
                        label="numero_tomador"
                        type="text"
                        placeholder="1004"
                        form={ThirtyForm}
                        schema={SCHEMAS['3']}
                      />
                    </div>
                    {customerAddress && customerAddress.cep && (
                      <>
                        <div className="flex flex-col col-span-4">
                          <label className="block text-base font-medium text-black/70">
                            Nome do município
                          </label>
                          <Input
                            label="municipio_tomador"
                            type="text"
                            placeholder="Digite o nome do município"
                            form={ThirtyForm}
                            schema={SCHEMAS['3']}
                          />
                        </div>
                        <div className="flex flex-col col-span-4">
                          <label className="block text-base font-medium text-black/70">
                            Logradouro
                          </label>
                          <Input
                            label="logradouro_tomador"
                            type="text"
                            placeholder="Digite o logradouro"
                            form={ThirtyForm}
                            schema={SCHEMAS['3']}
                          />
                        </div>
                        <div className="flex flex-col col-span-4">
                          <label className="block text-base font-medium text-black/70">
                            Bairro
                          </label>
                          <Input
                            label="bairro_tomador"
                            type="text"
                            placeholder="Digite o bairro"
                            form={ThirtyForm}
                            schema={SCHEMAS['3']}
                          />
                        </div>
                        <div className="flex flex-col col-span-4">
                          <label className="block text-base font-medium text-black/70">
                            UF
                          </label>
                          <Input
                            label="uf_tomador"
                            type="text"
                            placeholder="Digite a UF"
                            form={ThirtyForm}
                            schema={SCHEMAS['3']}
                          />
                        </div>
                      </>
                    )}
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
                        <option value="2">
                          Contribuinte isento de inscrição
                        </option>
                      </Select>
                    </div>
                    {borrowersIE == '1' && (
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
                          form={ThirtyForm}
                          schema={SCHEMAS['3']}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="footer mt-8 flex flex-row justify-between">
                <button
                  disabled={isLoading}
                  onClick={handleCancel}
                  className="flex items-center gap-3 rounded-lg bg-gray/50 px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:bg-gray/60"
                  type="button"
                >
                  {step == 1 ? 'Cancelar' : 'Voltar'}
                </button>

                <button
                  disabled={isLoading}
                  onClick={handleRegister}
                  className="flex items-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                  type="button"
                >
                  {!isLoading && (
                    <>
                      {step === 3 ? 'Cadastrar' : 'Próximo'}
                      <ArrowRightSolidSvg />
                    </>
                  )}

                  {isLoading && (
                    <div className="px-4">
                      <Loader size={16} stroke={3} color="#fff" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>

      <ScreenLoading
        isVisible={isLoading}
        timeBetweenCaptions={4000}
        captions={[
          'Preparando as malas virtuais para a sua jornada fiscal.',
          'Criando um caminho livre de turbulências para suas transações fiscais.',
          'Ajustando os cintos, estamos prestes a decolar nas notas fiscais.',
          'Calculando impostos com precisão e rapidez para você.',
          'Quase lá, estamos viajando pelo código para garantir uma experiência perfeita.',
        ]}
      />

      <Popup
        isVisible={isPopupVisible}
        onClickOutside={() => navigate('/veiculos/cadastrar')}
      >
        <div
          className="rounded-2xl border-l-8 border-primary bg-white p-4 shadow-lg sm:p-6 lg:p-8"
          role="alert"
        >
          <div className="flex items-center gap-4">
            <span className="shrink-0 rounded-full bg-primary p-2 text-white">
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
              Você ainda não tem veículos cadastrados!
            </p>
          </div>

          <p className="mt-4 text-gray/70">
            Para prosseguir e emitir uma nota fiscal, você precisa ter um
            veículo cadastrado na plataforma.
          </p>

          <div className="mt-6 sm:flex sm:gap-4">
            <button
              onClick={() => navigate('/notas')}
              className="inline-block w-full rounded-lg bg-gray/30 text-white px-5 py-3 text-center text-sm font-semibold sm:w-auto"
            >
              Voltar
            </button>

            <button
              onClick={() => navigate('/veiculos/cadastrar')}
              className="inline-block w-full rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
            >
              Cadastrar veículo
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
}
