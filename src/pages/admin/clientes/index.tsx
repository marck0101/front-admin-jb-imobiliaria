/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PageWrapper } from '../../../components/PageWrapper'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useFetch } from '../../../hooks/useFetch'
import { FormEvent, useEffect, useState } from 'react'
import { ICustomer } from '../../../@types/costumer'
//@ts-ignore
import { ReactComponent as AlertSvg } from '../../../assets/svgs/alert.svg'

//@ts-ignore
import { ReactComponent as FontAwesomeIcon } from '../../assets/svgs/alert.svg'

//@ts-ignore
import { ReactComponent as TrashSvg } from '../../../assets/svgs/trash-solid.svg'
//@ts-ignore
import { ReactComponent as PenToSquareSvg } from '../../../assets/svgs/pen-to-square-solid.svg'
import { NotFound } from '../../../components/NotFound'
import { Loader } from '../../../components/Loader'
import Tooltip from '@mui/material/Tooltip'
import { formatToCPF } from '../../../helpers/format-to-cpf'
import { formatToPhone } from '../../../helpers/phone'
import { toast } from 'react-toastify'
import { Popup } from '../../../components/Popup'
import { Pagination } from '../../../components/Pagination'
import { Input } from '../../../components/Input'

const PAGE_SIZE = 10

interface DisplayProps {
  page?: number
  status?: 'autorizado' | 'cancelado' | null
  to?: string | null
  name?: string | null
}

export default function Clientes() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  const [clientes, setClientes] = useState<Array<ICustomer>>([])
  const [client, setClient] = useState<null | string>(null)
  const [name, setName] = useState<string>('')

  const [isPopupVisible, setIsPopupVisible] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filtroPassageiros, setFiltroPassageiros] =
    useState<Array<ICustomer>>(clientes)

  const { api } = useFetch()

  useEffect(() => {
    display()
  }, [])

  const handleAskToDelete = (_id: string) => {
    setClient(_id)
    setIsPopupVisible(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/customers/${client}`)
      toast('Cliente excluído com sucesso!', {
        type: 'success',
        autoClose: 1500,
      })
      display()
    } catch (e) {
      console.log(e)
      toast('Não foi possível deletar!', { type: 'error', autoClose: 1500 })
    } finally {
      setIsPopupVisible(false)
    }
  }

  const handleEdit = (_id: string) => {
    navigate(`/clientes/${_id}`)
  }

  const display = async (
    { page }: DisplayProps = {
      page: 1,
    }
  ) => {
    setIsLoading(true)
    try {
      // const url = `/customers?limit=${PAGE_SIZE}&skip=${
      //   PAGE_SIZE * ((page || 1) - 1)
      // }&`

      const { data } = await api.get(`/home`)
      setClientes(data.data)
      setTotal(data.count)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePage = (page: number): void => {
    display({ page })
    setCurrentPage(page)
  }

  useEffect(() => {
    //faz um filro dos dados da api e seta de novo nos clientes
    filterCards()
  }, [name])

  const filterCards = async () => {
    const url = `/customers?name=${name}`
    const { data } = await api.get(url)
    setFiltroPassageiros(data.data)
  }

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    setName((e.target as HTMLInputElement).value)
  }

  const handleLimparFiltro = () => {
    // setName(((e.target as HTMLInputElement).innerHTML = ''));
    setName('')
    //@ts-ignore
    document.getElementById('filterClient').value = ''
  }

  useEffect(() => {
    console.log('Chegou aqui')

    const buscaApi = async () => {
      const response = await api.get('/home')
      console.log('response', response.data.data)
    }
    buscaApi()
  }, [])

  return (
    <>
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
                    Posts
                  </h1>
                  <p className="mt-1.5 text-sm text-black/50">
                    Aqui você pode ver todas as informações sobre os seus posts.
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
                    onClick={() => navigate('/clientes/cadastrar')}
                    className="block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition  hover:scale-105 hover:shadow-xl focus:outline-none focus:ring"
                    type="button"
                  >
                    Cadastrar Cliente
                  </button>
                </div>
              </motion.div>
            </div>
            <div
              style={{ height: 0.2 }}
              className="bg-stone-300 rounded-lg my-8"
            ></div>
            <div className="flex flex-row flex-nowrap justify-between mb-5 w-full gap-4">
              <Input
                placeholder="Nome do Cliente"
                name="filterClient"
                id="filterClient"
                className={
                  'name outline-0 px-3 py-3 mt-1 w-full rounded-xl shadow-sm text-base focus:border-primary border border-slate-200 bg-white'
                }
                onInput={(e) => {
                  handleInputChange(e)
                }}
              />

              {name && (
                <motion.button
                  onClick={() => {
                    handleLimparFiltro()
                  }}
                  className="text-nowrap text-black border border-black appearance-none outline-0 px-4 py-2.5 mt-1.5 rounded-xl shadow-sm text-base focus:border-primary transition  hover:shadow-lg focus:outline-none focus:ring"
                >
                  Limpar Filtro
                </motion.button>
              )}
            </div>

            {isLoading && (
              <div className="w-full flex items-center justify-center mt-16">
                <Loader />
              </div>
            )}
            {!isLoading && clientes.length < 1 && (
              <NotFound title="Nenhum cliente encontrado!" />
            )}
            {!isLoading && clientes.length >= 1 && (
              <div>
                <div className="grid grid-cols-12">
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    Nome
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    Status
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    CPF / CNPJ
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-2">
                    Telefone
                  </p>
                  <p className="font-semibold text-base text-gray/50 col-span-4">
                    Ações
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  {name ? (
                    <>
                      {filtroPassageiros?.map((cliente) => (
                        <Card
                          key={cliente?._id}
                          onDelete={handleAskToDelete}
                          onEdit={handleEdit}
                          data={cliente}
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {clientes?.map((cliente) => (
                        <Card
                          key={cliente?._id}
                          onDelete={handleAskToDelete}
                          onEdit={handleEdit}
                          data={cliente}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
            {name ? (
              <></>
            ) : (
              <>
                <div className="flex flex-row justify-between items-center mt-8">
                  <p className="text-sm text-slate-500">
                    {(currentPage - 2) * PAGE_SIZE > 0
                      ? (currentPage - 1) * PAGE_SIZE
                      : 1}{' '}
                    -{' '}
                    {currentPage * PAGE_SIZE < total
                      ? currentPage * PAGE_SIZE
                      : total}{' '}
                    de {total} Clientes
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

                  <p className="text-transparent">Clientes por página</p>
                </div>
              </>
            )}
          </div>
        </div>
      </PageWrapper>
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
              Tem certeza que deseja remover esse cliente?
            </p>
          </div>

          <p className="mt-4 text-gray/70">
            Tem certeza que deseja remover esse cliente? Essa ação é
            irreversível e você não tera mais acesso a esse cliente.
          </p>

          <div className="mt-6 sm:flex sm:gap-4">
            <button
              onClick={() => setIsPopupVisible(false)}
              className="inline-block w-full rounded-lg bg-gray/30 text-white px-5 py-3 text-center text-sm font-semibold sm:w-auto"
            >
              Cancelar
            </button>

            <button
              onClick={handleDelete}
              className="inline-block w-full rounded-lg bg-red-500 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
            >
              Quero deletar esse cliente
            </button>
          </div>
        </div>
      </Popup>
    </>
  )
}

interface CardProps {
  data: ICustomer
  onDelete: (_id: string) => void
  onEdit: (_id: string) => void
}

function Card({ data, onDelete, onEdit }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="grid grid-cols-12 items-center justify-center w-full rounded-2xl bg-white shadow-sm border border-slate-200 py-5">
        <Tooltip
          title={
            data?.fantasyname
              ? data?.fantasyname.toUpperCase()
              : data?.name.toUpperCase()
          }
        >
          <p className="text-black/70 text-sm text-left font-bold col-span-2 ml-8 truncate pr-4">
            {data?.fantasyname
              ? data?.fantasyname.toUpperCase()
              : data?.name.toUpperCase()}
          </p>
        </Tooltip>

        {data?.name && (data?.cpf || data?.cnpj) && data?.phone ? (
          <Tooltip title="Cadastro Atualizado">
            <div className="bg-emerald-400/20 col-span-2 text-emerald-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
              <div className="h-3 w-3 bg-emerald-400 rounded-2xl"></div>
              <p className="text-sm font-bold">Atualizado</p>
            </div>
          </Tooltip>
        ) : (
          <Tooltip title="Cadastro Incompleto">
            <div className="relative bg-amber-400/20 col-span-2 text-yellow-400 flex flex-row gap-2 items-center justify-center px-5 py-2 w-fit rounded-full">
              <div>
                <AlertSvg />
              </div>
              <p className="text-sm font-bold">Alerta</p>
              <div className="absolute top-0 left-0 w-0 h-0 border-4 border-solid border-transparent border-t-4 border-rose-400"></div>
            </div>
          </Tooltip>
        )}

        {data?.cpf ? (
          <p className="text-black/70 text-sm text-left font-bold col-span-2">
            {data?.cpf ? formatToCPF(data?.cpf) : ' --/--/--'}
          </p>
        ) : (
          <p className="text-black/70 text-sm text-left font-bold col-span-2">
            {data?.cnpj ? formatToCPF(data?.cnpj) : ' --/--/--'}
          </p>
        )}

        <p className="text-black/70 text-left text-sm font-bold col-span-2">
          {data?.phone ? formatToPhone(data?.phone) : '--/--/--'}
        </p>

        <div className="flex flex-row gap-3 col-span-2 mr-8">
          <button
            onClick={() => onEdit(data?._id)}
            className="bg-gray/10 px-5 py-2 rounded-3xl text-black/50 text-sm  flex flex-row gap-2 items-center justify-center transition hover:shadow-md hover:bg-gray/20 hover:text-gray/70"
          >
            <PenToSquareSvg />
            <p className="text-sm font-bold col-span-2">Editar</p>
          </button>
          <button
            onClick={() => onDelete(data?._id)}
            className="bg-gray/10 px-5 py-2 rounded-3xl text-black/50 text-sm flex flex-row gap-2 items-center justify-center transition hover:shadow-md hover:bg-gray/20 hover:text-gray/70"
          >
            <TrashSvg />
            <p className="font-bold col-span-2">Excluir</p>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
