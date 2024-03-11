import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { api } from '../helpers/api';

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface SignInProps {
  email: string;
  password: string;
}

interface IAuthContextData {
  user: User;
  isUserStorageLoading: boolean;
  signIn: (data: SignInProps) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext({} as IAuthContextData);

const TOKEN_STORAGE_KEY = 'Lo1rb@WOeSZjA%qlua8h1ACAQrz7Tr2%qL0j%62VWn';

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const [isUserStorageLoading, setIsUserStorageLoading] = useState(true);

  async function signIn({ email, password }: SignInProps) {
    localStorage.clear();

    const { data } = await api.post(
      '/authenticate',
      { email, password },
      { validateStatus: () => true },
    );

    if (data._id && data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setUser(data);
      return;
    }

    if (data.UIDescription) {
      toast(data.UIDescription || 'Não foi possível fazer login!', {
        type: 'error',
        autoClose: 2500,
      });
    }
  }

  async function signOut() {
    localStorage.clear();
    setUser({} as User);
  }

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
          const { data } = await api.post('/authenticate', { token });
          if (data) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            setUser({ ...data, token });
          } else {
            signOut();
          }
        } else {
          signOut();
        }
      } catch (e) {
        signOut();
      }
      setIsUserStorageLoading(false);
    })();
  }, []);
  // console.log("user",user)

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        isUserStorageLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth };
