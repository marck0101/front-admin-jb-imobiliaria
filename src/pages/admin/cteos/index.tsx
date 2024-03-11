import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../../components/Loader';
import { NotFound } from '../../../components/NotFound';
import { PageWrapper } from '../../../components/PageWrapper';
import { useFetch } from '../../../hooks/useFetch';

import { motion } from 'framer-motion';
import { ICteos } from '../../../@types/cteos';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../../helpers/format-currency';

import './styles.css';

/* eslint-disable */
//@ts-ignore
import locale from 'antd/es/date-picker/locale/pt_BR';

//@ts-ignore
import { ReactComponent as DonwloadSvg } from '../../../assets/svgs/download-solid.svg';
import { Popup } from '../../../components/Popup';
import { Input } from '../../../components/Input';
import { Pagination } from '../../../components/Pagination';
import { DatePicker } from 'antd';

//@ts-ignore
import dayjs from 'dayjs';

import { getMonthNameByIndex } from '../../../helpers/get-month-name';
import { useDebounce } from '../../../hooks/useDebounce';
import { RangeValue } from 'rc-picker/lib/interface';

interface DisplayProps {
  page?: number;
  status?: 'autorizado' | 'cancelado' | null;
  since?: string | null;
  to?: string | null;
  name?: string | null;
}

//@ts-ignore
import html2pdf from 'html2pdf.js';
import { formatToNumber } from '../../../helpers/fomat-to-number';
import { generateRandomUUID } from '../../../helpers/generate-random-uuid';
import { capitalize } from '../../../helpers/capitalize';

const PAGE_SIZE = 10;

export function Cteos() {
  const navigate = useNavigate();

  const { api } = useFetch();

  const [isLoading, setIsLoading] = useState(true);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isPDFLoading, setIsPDFLoading] = useState(false);
  const [PDFData, setPDFData] = useState(
    {} as { cteos: Array<ICteos>; dates: { since: Date; to: Date } },
  );

  const [dates, setDates] = useState<null | { since: string; to: string }>(
    null,
  );
  const [status, setStatus] = useState<'autorizado' | 'cancelado' | null>(
    'autorizado',
  );
  const [name, setName] = useState<string>('');
  // const [rangePickerValue, setRangePickerValue] = useState<RangeValue<dayjs.Dayjs> | null>(null);
  const [rangePickerValue, setRangePickerValue] = useState<dayjs.Dayjs | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);

  const [total, setTotal] = useState(0);
  const [cteos, setCteos] = useState([] as Array<ICteos>);
  const [focusedCteos, setFocusedCteos] = useState<string | null>(null);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [justification, setJustification] = useState('');

  const display = async (
    { page, status, name, since, to }: DisplayProps = {
      page: 1,
      status: null,
      name: null,
      since: null,
      to: null,
    },
  ) => {
    setIsLoading(true);
    try {
      let url = `/cteos?limit=${PAGE_SIZE}&skip=${PAGE_SIZE * ((page || 1) - 1)}&`;

      if (status) {
        url += `status=${status}&`;
      }
      if (name) {
        url += `name=${name}&`;
      }
      if (since) {
        url += `since=${since}&`;
      }
      if (to) {
        url += `to=${to}&`;
      }

      const { data } = await api.get(url);
      setCteos(data.data.filter((c: ICteos) => c.ref && c.requisicao));
      setTotal(data.count);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (page: number): void => {
    // console.log(page)
    display({ page });
    setCurrentPage(page);
  };

  const handleAskToCancel = (ref: string) => {
    setIsPopupVisible(true);
    setFocusedCteos(ref);
  };

  const handleCancel = () => {
    setIsCancelLoading(true);
    api
      .delete(`/cteos/${focusedCteos}?justificativa=${justification}`)
      .then(() => {
        toast('Nota cancelada com sucesso!', {
          type: 'success',
          autoClose: 1500,
        });
        display();
        setIsPopupVisible(false);
        setFocusedCteos(null);
        setJustification('');
      })
      .catch((e) => {
        console.log(e);
        toast('Não foi possível cancelar!', { type: 'error', autoClose: 1500 });
      })
      .finally(() => {
        setIsCancelLoading(false);
      });
  };

  const handleGeneratePDF = async () => {
    setIsPDFLoading(true);
    try {
      const since = dates?.since || dayjs().add(-30, 'day').toISOString();
      const to = dates?.to || dayjs().toISOString();

      let url = `/cteos?since=${since}&to=${to}&limit=100&`;

      if (status) {
        url += `status=${status}&`;
      }
      if (name) {
        url += `name=${name}&`;
      }

      const { data } = await api.get(url);
      if (!data.data || !data.data.length) {
        throw new Error();
      }

      setPDFData({
        cteos: data.data,
        dates: { since, to },
      });

      const options = {
        margin: [0.5, 0, 0.5, 0],
        filename: `${generateRandomUUID()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'l' },
      };

      await new Promise((r) => setTimeout(r, 500));

      const $doc = document.querySelector('.html-to-pdf');

      // console.log($doc);
      await html2pdf($doc, options);

      toast('PDF Gerado com sucesso!', { type: 'success', autoClose: 1500 });

      setTimeout(() => {
        setPDFData(
          {} as { cteos: Array<ICteos>; dates: { since: Date; to: Date } },
        );
      }, 5000);
    } catch (e) {
      toast('Não foi possível gerar seu PDF!', {
        type: 'error',
        autoClose: 1500,
      });
    } finally {
      setIsPDFLoading(false);
    }
  };

  useDebounce(
    () => {
      display({
        status: status,
        name: name,
        since: dates?.since,
        to: dates?.to,
      });

      const $status = document.querySelector('.status') as HTMLInputElement;
      $status.value = status || '';

      const $name = document.querySelector('.name') as HTMLInputElement;
      $name.value = name || '';
    },
    [name, status, dates],
    350,
  );

  return (
    <>
      <title>Notas | VDR Petri - Turismo e Viagens</title>
      <PageWrapper>
        <div>
          <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-16 ">
            <div className="sm:flex sm:items-center sm:justify-between">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    Notas
                  </h1>

                  <p className="mt-1.5 text-sm text-black/50">
                    Aqui você pode ver todas as informações sobre suas notas.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
                  <button
                    onClick={handleGeneratePDF}
                    disabled={isPDFLoading}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring hover:border-primary hover:text-primary hover:bg-primary/05"
                    type="button"
                  >
                    {!isPDFLoading && (
                      <>
                        <span className="text-sm font-medium">Gerar PDF</span>
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
                      </>
                    )}

                    {isPDFLoading && <Loader size={14} color="#000" />}
                  </button>

                  <button
                    onClick={() => navigate('/notas/cadastrar')}
                    className="block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                    type="button"
                  >
                    Cadastrar Nota
                  </button>
                </div>
              </motion.div>
            </div>

            <div
              style={{ height: 0.2 }}
              className="bg-stone-300 rounded-lg my-8"
            ></div>

            <div className="grid grid-cols-12 gap-2 pb-8">
              <input
                placeholder="Nome do Tomador"
                className={
                  (name || dates || status ? 'col-span-4' : 'col-span-6') +
                  ' name col-span-4 outline-0 px-3 py-3 mt-1 w-full rounded-xl shadow-sm text-base focus:border-primary border border-slate-200 bg-white'
                }
                onInput={(e) => {
                  setName((e.target as HTMLInputElement).value);
                }}
              />

              <select
                onChange={(e) =>
                  setStatus(
                    (e.target.value as 'autorizado' | 'cancelado') || null,
                  )
                }
                required
                className="status col-span-3 appearance-none outline-0 px-4 py-2.5 mt-1 w-full rounded-xl border border-slate-200  bg-white shadow-sm text-base focus:border-primary"
              >
                <option value="" disabled hidden>
                  Status
                </option>
                <option value="">Todas</option>
                <option selected value="autorizado">
                  Disponíveis
                </option>
                <option value="cancelado">Canceladas</option>
              </select>

              <DatePicker.RangePicker
                value={rangePickerValue || undefined}
                presets={[
                  {
                    label: 'Últimos 7 dias',
                    value: [dayjs().add(-7, 'd'), dayjs()],
                  },
                  {
                    label: 'Últimos 14 dias',
                    value: [dayjs().add(-14, 'd'), dayjs()],
                  },
                  {
                    label: 'Últimos 30 dias',
                    value: [dayjs().add(-30, 'd'), dayjs()],
                  },
                  {
                    label: 'Últimos 90 dias',
                    value: [dayjs().add(-90, 'd'), dayjs()],
                  },
                  { label: '----------------', value: [dayjs(), dayjs()] },
                  {
                    label: `${getMonthNameByIndex(dayjs().month() - 2)}`,
                    value: [
                      dayjs(
                        new Date(
                          new Date().getFullYear(),
                          dayjs().month() - 2,
                          1,
                        ),
                      ),
                      dayjs(
                        new Date(
                          new Date().getFullYear(),
                          dayjs().month() - 1,
                          0,
                        ),
                      ),
                    ],
                  },
                  {
                    label: `${getMonthNameByIndex(dayjs().month() - 1)}`,
                    value: [
                      dayjs(
                        new Date(
                          new Date().getFullYear(),
                          dayjs().month() - 1,
                          1,
                        ),
                      ),
                      dayjs(
                        new Date(new Date().getFullYear(), dayjs().month(), 0),
                      ),
                    ],
                  },
                  {
                    label: `${getMonthNameByIndex(dayjs().month())}`,
                    value: [
                      dayjs(
                        new Date(new Date().getFullYear(), dayjs().month(), 1),
                      ),
                      dayjs(
                        new Date(
                          new Date().getFullYear(),
                          dayjs().month() + 1,
                          0,
                        ),
                      ),
                    ],
                  },
                ]}
                onChange={(e) => {
                  if (e && e.length) {
                    setRangePickerValue(e);
                    setDates({
                      since: (e[0] || new Date()).toISOString(),
                      to: (e[1] || new Date()).toISOString(),
                    });
                  } else {
                    setRangePickerValue(null);
                  }
                }}
                locale={locale}
                className={
                  'col-span-3 cursor-pointer outline-0 px-4 py-2.5 mt-1 w-full rounded-xl border border-slate-200 bg-white bg-transparent shadow-sm text-base focus:border-primary'
                }
                format="DD/MM/YYYY"
              />

              {(name || dates || status) && (
                <motion.button
                  onClick={() => {
                    setDates(null);
                    setRangePickerValue(null);
                    setStatus(null);
                    setName('');
                  }}
                  className="col-span-2 text-black border border-black appearance-none outline-0 px-4 py-2.5 mt-1.5 w-full rounded-xl shadow-sm text-base focus:border-primary transition  hover:shadow-lg focus:outline-none focus:ring"
                >
                  Limpar Filtros
                </motion.button>
              )}
            </div>

            {isLoading && (
              <div className="w-full flex items-center justify-center mt-16">
                <Loader />
              </div>
            )}

            {!isLoading && cteos.length < 1 && (
              <NotFound title="Nenhuma nota encontrada!" />
            )}

            {!isLoading && cteos.length >= 1 && (
              <div>
                <div className="grid grid-cols-12">
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    Tomador
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    Valor
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-2 ">
                    Status
                  </p>
                  <p className="font-semibold text-base text-gray/50  col-span-2">
                    Criado em
                  </p>

                  <p className="font-semibold text-base text-gray/50 col-span-4 ">
                    Ações
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  {cteos.map((c) => (
                    <Card key={c._id} onCancel={handleAskToCancel} data={c} />
                  ))}
                </div>

                <div className="flex flex-row justify-between items-center mt-8">
                  <p className="text-sm text-slate-500">
                    {(currentPage - 2) * PAGE_SIZE > 0
                      ? (currentPage - 1) * PAGE_SIZE
                      : 1}{' '}
                    -{' '}
                    {currentPage * PAGE_SIZE < total
                      ? currentPage * PAGE_SIZE
                      : total}{' '}
                    de {total} Notas
                  </p>

                  {total > 3 && (
                    <Pagination
                      onPageChange={handleChangePage}
                      totalCount={total}
                      siblingCount={1}
                      currentPage={currentPage}
                      pageSize={PAGE_SIZE}
                    />
                  )}

                  <p className="text-transparent">Notas por página</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>

      <Popup
        isVisible={isPopupVisible}
        onClickOutside={() => {
          if (isCancelLoading) return;
          setIsPopupVisible(false);
          setFocusedCteos(null);
          setJustification('');
        }}
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
              Qual o motivo do cancelamento?
            </p>
          </div>

          <p className="mt-4 text-gray/70">
            Para cancelar uma nota fiscal é obrigatório uma justificativa para o
            cancelamento.
          </p>

          <div className="mt-3">
            <Input
              onInput={(e) =>
                setJustification((e.target as HTMLInputElement).value)
              }
              placeholder="Digite uma justificativa para o cancelamento"
            />
            {!justification && (
              <p className="mt-2 text-red-500 font-semibold text-sm">
                Campo obrigatório!
              </p>
            )}

            {justification && justification.replaceAll(' ', '').length < 15 && (
              <p className="mt-2 text-red-500 font-semibold text-sm">
                Mínimo 15 digítos!
              </p>
            )}
          </div>

          <div className="mt-6 sm:flex sm:gap-4">
            <button
              disabled={isCancelLoading}
              onClick={() => {
                setIsPopupVisible(false);
                setFocusedCteos(null);
                setJustification('');
              }}
              className="inline-block w-full rounded-lg bg-gray/30 text-white px-5 py-3 text-center text-sm font-semibold sm:w-auto"
            >
              Cancelar
            </button>

            <button
              disabled={isCancelLoading}
              onClick={handleCancel}
              className="inline-block w-full rounded-lg bg-red-500 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
            >
              {isCancelLoading ? (
                <Loader size={16} color="#fff" secondaryColor="#ffffff" />
              ) : (
                'Cancelar Nota Fiscal'
              )}
            </button>
          </div>
        </div>
      </Popup>

      {isPDFLoading && PDFData.dates && PDFData.cteos?.length && (
        <div className="html-to-pdf px-10">
          <h1 className="center text-4xl mb-10 font-medium">
            VDR PETRI TURISMO LTDA
          </h1>

          <div className="flex flex-row w-full justify-between items-center">
            <div>
              <p>0106 VDR PETRI TURISMO LTDA - Matriz</p>

              <p>CNPJ: 05.435.582/0001-52</p>
            </div>

            <div className="text-end">
              <p>{new Date().toLocaleDateString('pt-br')}</p>
              <p>
                Período:{' '}
                {new Date(PDFData.dates?.since || null).toLocaleDateString(
                  'pt-br',
                )}{' '}
                a{' '}
                {new Date(PDFData.dates?.to || null).toLocaleDateString(
                  'pt-br',
                )}
              </p>
            </div>
          </div>

          <table className="mt-10">
            <thead>
              <tr>
                <th className="text-left" style={{ width: '12%' }}>
                  Data
                </th>
                <th className="text-left" style={{ width: '10%' }}>
                  Status
                </th>
                <th className="text-left" style={{ width: '8%' }}>
                  Número
                </th>
                <th className="text-left" style={{ width: '6%' }}>
                  Mod
                </th>
                <th className="text-left" style={{ width: '8%' }}>
                  CFOP
                </th>
                <th className="text-left" style={{ width: '8%' }}>
                  UF
                </th>
                <th className="text-left" style={{ width: '6%' }}>
                  Aliq
                </th>
                <th className="text-left" style={{ width: '10%' }}>
                  Vr Contábil
                </th>
                <th className="text-left" style={{ width: '10%' }}>
                  Base Cálculo
                </th>
                <th className="text-left" style={{ width: '10%' }}>
                  Vr Imposto
                </th>
              </tr>
            </thead>
            <tbody>
              {PDFData.cteos.map((c) => (
                <tr>
                  <td>
                    <div>
                      {new Date(c.requisicao.data_emissao).toLocaleDateString(
                        'pt-br',
                      )}
                    </div>
                  </td>
                  <td>
                    <div>{capitalize(c.status)}</div>
                  </td>
                  <td>
                    <div>{c.numero}</div>
                  </td>
                  <td>
                    <div>{c.modelo}</div>
                  </td>
                  <td>
                    <div>{c.requisicao.cfop}</div>
                  </td>
                  <td>
                    <div>{c.requisicao.uf_envio}</div>
                  </td>
                  <td>
                    <div>{c.requisicao.icms_aliquota || 0}</div>
                  </td>
                  <td>
                    <div>{c.requisicao.valor_receber}</div>
                  </td>
                  <td>
                    <div>{c.requisicao.icms_base_calculo || 0}</div>
                  </td>
                  <td>
                    <div>{c.requisicao.valor_total_tributos || 0}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="mt-20 font-bold text-base mb-4">Resumo Total</h4>
          <table className="w-10/12">
            <thead>
              <tr>
                <th className="text-left" style={{ width: '5%' }}>
                  Imposto
                </th>
                <th className="text-left" style={{ width: '5%' }}>
                  Vr Contábil
                </th>
                <th className="text-left" style={{ width: '5%' }}>
                  Base Cálculo
                </th>
                <th className="text-left" style={{ width: '20%' }}>
                  Vr Imposto
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div>
                    {PDFData.cteos
                      .reduce(
                        (acc, c) =>
                          acc + formatToNumber(c.requisicao.icms_aliquota),
                        0,
                      )
                      .toFixed(2)}
                  </div>
                </td>
                <td>
                  <div>
                    {PDFData.cteos
                      .reduce(
                        (acc, c) =>
                          acc + formatToNumber(c.requisicao.valor_receber),
                        0,
                      )
                      .toFixed(2)}
                  </div>
                </td>
                <td>
                  <div>
                    {PDFData.cteos
                      .reduce(
                        (acc, c) =>
                          acc + formatToNumber(c.requisicao.icms_base_calculo),
                        0,
                      )
                      .toFixed(2)}
                  </div>
                </td>
                <td>
                  <div>
                    {PDFData.cteos
                      .reduce(
                        (acc, c) =>
                          acc +
                          formatToNumber(c.requisicao.valor_total_tributos),
                        0,
                      )
                      .toFixed(2)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

interface CardProps {
  data: ICteos;
  onCancel: (_id: string) => void;
}

function Card({ data, onCancel }: CardProps) {
  //@ts-ignore
  const handleCancel = (e) => {
    e.stopPropagation();
    if (onCancel && typeof onCancel == 'function') onCancel(data.ref);
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      onClick={() => {
        window.open(data.caminho_dacte, '_blank');
      }}
    >
      <div className="grid grid-cols-12 items-center justify-center w-full rounded-2xl bg-white shadow-sm border border-slate-200 py-5">
        <div className="col-span-2 ml-8">
          <p className="w-full pr-4 text-black/70 text-sm font-bold truncate text-left">
            {data.requisicao.nome_fantasia_tomador}
          </p>
        </div>

        <p className="text-black/70 text-sm font-bold col-span-2 text-left">
          {formatCurrency(Number(data.requisicao.valor_total))}
        </p>

        {data.status == 'processando_autorizacao' && (
          <div className="bg-amber-400/20 col-span-2 text-amber-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
            <div className="h-3 w-3 bg-amber-400 rounded-2xl"></div>
            <p className="text-sm font-bold">Processando</p>
          </div>
        )}
        {data.status == 'autorizado' && (
          <div className="bg-green-400/20 col-span-2 text-green-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
            <div className="h-3 w-3 bg-green-400 rounded-2xl hidden xl:block"></div>
            <p className="text-sm font-bold">Disponível</p>
          </div>
        )}
        {data.status == 'cancelado' && (
          <div className="bg-red-400/20 col-span-2 text-red-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
            <div className="h-3 w-3 bg-red-400 rounded-2xl"></div>
            <p className="text-sm font-bold">Cancelado</p>
          </div>
        )}
        {data.status == 'denegado' && (
          <div className="bg-red-400/20 col-span-2 text-red-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
            <div className="h-3 w-3 bg-red-400 rounded-2xl"></div>
            <p className="text-sm font-bold">Denegado</p>
          </div>
        )}
        {data.status == 'erro_autorizacao' && (
          <div className="bg-red-400/20 col-span-2 text-red-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
            <div className="h-3 w-3 bg-red-400 rounded-2xl"></div>
            <p className="text-sm font-bold">Não Autorizado</p>
          </div>
        )}

        {/* <p className="text-black/70 text-sm font-bold col-span-2 text-left">{data.requisicao.uf_inicio} - {data.requisicao.uf_fim}</p> */}

        <p className="text-black/70 text-sm font-bold col-span-2 text-left">
          {new Date(data.createdAt).toLocaleDateString()}
        </p>

        <div className="flex flex-row gap-3 col-span-2 mr-8">
          <a
            href={data.caminho_dacte}
            target="_blank"
            className="bg-gray/10 px-5 py-2 rounded-3xl text-black/50 text-sm  flex flex-row gap-2 items-center justify-center transition hover:shadow-md hover:bg-gray/20 hover:text-gray/70"
          >
            <DonwloadSvg />
            <p className="text-sm font-bold col-span-2">PDF</p>
          </a>
          {data.status != 'cancelado' && (
            <button
              onClick={handleCancel}
              className="bg-gray/10 px-5 py-2 rounded-3xl text-black/50  text-sm flex flex-row gap-2 items-center justify-center transition hover:shadow-md hover:bg-gray/20 hover:text-gray/70"
            >
              <p className="font-bold col-span-2">Cancelar</p>
            </button>
          )}
        </div>
      </div>
    </motion.button>
  );
}
