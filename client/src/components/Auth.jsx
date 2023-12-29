import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const Auth = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('Test1234');

  const navigate = useNavigate();

  const handleFormSubmit = async (e, endpoint) => {
    e.preventDefault();
    setIsLoading(true);

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
      toast.error(error?.message || '登出時出錯了');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Tabs
        defaultValue="login"
        className="form-wrapper max-w-xl mx-auto md:w-[500px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">登入</TabsTrigger>
          <TabsTrigger value="register">註冊</TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <div className="bg-white px-20 py-14 rounded-lg md:border md:shadow-lg">
            <h2
              className="text-3xl font-bold mb-4 text-gray-800"
              id="register-form"
            >
              註冊帳號
            </h2>
            <form
              className="register space-y-reverse space-y-5"
              onSubmit={(e) => handleFormSubmit(e, 'signup')}
            >
              <Label htmlFor="name">用戶名：</Label>
              <Input
                className="w-full border p-2 rounded-lg"
                type="text"
                id="reg-name"
                name="name"
                autoCapitalize="none"
                autoCorrect="off"
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Label htmlFor="email">Email: </Label>
              <Input
                type="email"
                id="reg-email"
                name="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <Label htmlFor="password">密碼： </Label>
              <Input
                type="password"
                name="password"
                id="reg-password"
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button disabled={isLoading} type="submit" id="register-btn">
                註冊
              </Button>
            </form>
          </div>
        </TabsContent>
        <TabsContent value="login">
          <div className="bg-white px-20 py-14 rounded-lg md:border md:shadow-lg">
            <h2
              className="text-3xl font-bold mb-4 text-gray-800"
              id="login-form"
            >
              登入 TripPin
            </h2>
            <form
              className="login space-y-reverse space-y-5"
              onSubmit={(e) => handleFormSubmit(e, 'login')}
            >
              <Label className="text-gray-600" htmlFor="email">
                Email:{' '}
              </Label>
              <Input
                type="email"
                name="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                id="login-email"
                defaultValue={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <Label className="text-gray-600" htmlFor="password">
                密碼：
              </Label>
              <Input
                type="password"
                name="password"
                id="login-password"
                defaultValue={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-between">
                <Button disabled={isLoading} type="submit" id="login-btn">
                  登入
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Auth;
