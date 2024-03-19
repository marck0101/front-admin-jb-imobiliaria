import { Input } from '../../components/Input'
import BgImage from './../../assets/images/product-2-min.jpg'
import Imob from './../../assets/images/imob.png'

import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from '../../components/Loader'
import { useAuth } from '../../contexts/auth'
// import { toast } from 'react-toastify'

const USER_SCHEMA = z.object({
  email: z
    .string()
    .email('Preencha um e-mail válido')
    .nonempty('O email é obrigatório'),
  password: z.string().nonempty('A senha é obrigatória'),
})

type FormData = z.infer<typeof USER_SCHEMA>

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const { signIn, isUserStorageLoading } = useAuth()

  const Form = useForm({
    resolver: zodResolver(USER_SCHEMA),
  })

  const handleSignIn = async ({ email, password }: FormData) => {
    setIsLoading(true)
    try {
      await signIn({ email, password })
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <title>Entrar</title>
      <div className="h-screen w-screen flex flex-row">
        <div
          className="h-full w-7/12 shadow-xl hidden md:block"
          style={{
            backgroundImage: `url(${BgImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom',
          }}
        ></div>

        <div className="w-full h-full flex flex-col justify-between px-16 sm:px-24">
          <div className="mt-6">
            <div className="w-full flex justify-center my-10">
              <img src={Imob} alt="Logo VDR Petri" width="250px" />
            </div>

            <div className="mt-20">
              <p className="text-5xl font-bold">Entrar</p>
              <p className="text-xl text-black/50 mt-2">
                Entre agora no melhor sistema para <br /> controle de
                Imobiliaria
              </p>

              <div className="flex flex-col gap-4 mt-8">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-base font-medium text-black/70"
                  >
                    E-mail de usuário
                  </label>
                  <Input
                    type="email"
                    placeholder="exemplo@gmail.com"
                    label="email"
                    form={Form}
                    schema={USER_SCHEMA}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-base font-medium text-black/70"
                  >
                    Senha
                  </label>
                  <Input
                    type="password"
                    placeholder="******"
                    label="password"
                    form={Form}
                    schema={USER_SCHEMA}
                  />
                  {/* {Form.formState.errors.password && <p className='mt-2 text-red-500 font-semibold text-sm'>{Form.formState.errors.password.message}</p>} */}
                </div>
              </div>

              <div className="mt-8">
                <button
                  disabled={isLoading || isUserStorageLoading}
                  onClick={Form.handleSubmit(handleSignIn)}
                  className="bg-primary text-white font-bold w-full rounded-lg py-3 text-base"
                >
                  {isLoading || isUserStorageLoading ? (
                    <div className="w-full flex items-center justify-center">
                      <Loader
                        size={22}
                        stroke={4}
                        color="#fff"
                        secondaryColor="#f1f1f1"
                      />
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="text-slate-400 text-sm mx-auto md:mx-0 mb-4 w-full text-center">
            <p>@ 2024, Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </>
  )
}
