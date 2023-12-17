import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Auth = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentForm, setCurrentForm] = useState('login');
  const navigate = useNavigate();

  const handleFormSubmit = async (e, endpoint) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_HOST}api/v1/auth/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            provider: 'native',
            password,
          }),
        },
      );

      const json = await response.json();

      if (json.error) {
        return toast.error(json.error);
      }
      toast.success('帳號密碼登入成功！');

      const {
        data: { access_token, user },
      } = json;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate(-1);
    } catch (error) {
      console.log(error);
    }
  };

  const switchToRegister = () => {
    setCurrentForm('register');
  };

  const switchToLogin = () => {
    setCurrentForm('login');
  };

  return (
    <>
      <div className="form-wrapper max-w-xl mx-auto">
        {currentForm === 'register' && (
          <>
            <div className="bg-white p-10 rounded-lg xl:shadow-lg mt-10">
              <h2
                className="text-3xl font-bold mb-10 text-gray-800"
                id="register-form"
              >
                註冊帳號
              </h2>
              <form
                className="register space-y-reverse space-y-5"
                onSubmit={(e) => handleFormSubmit(e, 'signup')}
              >
                <label className="text-gray-600" htmlFor="name">
                  用戶名：{' '}
                </label>
                <input
                  className="w-full border p-2 rounded-lg"
                  type="text"
                  id="reg-name"
                  name="name"
                  autoComplete="off"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <label className="text-gray-600" htmlFor="email">
                  Email:{' '}
                </label>
                <input
                  className="w-full border p-2 rounded-lg"
                  type="email"
                  id="reg-email"
                  name="email"
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label className="text-gray-600" htmlFor="password">
                  密碼：{' '}
                </label>
                <input
                  className="w-full border p-2 rounded-lg"
                  type="password"
                  name="password"
                  id="reg-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-between">
                  <button
                    className="bg-black text-white py-2 px-4 rounded-lg hover:bg-black"
                    type="submit"
                    id="register-btn"
                  >
                    註冊
                  </button>
                  <button
                    onClick={switchToLogin}
                    className="text-blue-700 cursor-pointer"
                  >
                    已經有帳號了嗎？請登入
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {currentForm === 'login' && (
          <>
            <div className="bg-white p-10 rounded-lg xl:shadow-lg mt-10">
              <h2
                className="text-3xl font-bold mb-10 text-gray-800"
                id="login-form"
              >
                登入 TripPin
              </h2>
              <form
                className="login space-y-reverse space-y-5"
                onSubmit={(e) => handleFormSubmit(e, 'login')}
              >
                <label className="text-gray-600" htmlFor="email">
                  Email:{' '}
                </label>
                <input
                  className="w-full border p-2 rounded-lg"
                  type="email"
                  name="email"
                  id="login-email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="text-gray-600" htmlFor="password">
                  密碼：{' '}
                </label>
                <input
                  className="w-full border p-2 rounded-lg"
                  type="password"
                  name="password"
                  id="login-password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-between">
                  <button
                    className="bg-black text-white py-2 px-4 rounded-lg hover:bg-black"
                    type="submit"
                    id="login-btn"
                  >
                    登入
                  </button>
                  <button
                    onClick={switchToRegister}
                    className="text-blue-700 cursor-pointer"
                  >
                    沒有帳號嗎？請註冊
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Auth;
