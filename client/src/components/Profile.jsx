import { useNavigate, useOutletContext } from 'react-router-dom';
import Loading from './Loading';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { UserCircle } from 'lucide-react';

const SignOutButton = () => {
  const navigate = useNavigate();
  const handleClearLocalStorage = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    toast.warning('您已登出！', {
      duration: 2000,
    });
    navigate('/');
  };

  return <Button onClick={handleClearLocalStorage}>登出</Button>;
};

const Profile = () => {
  const profileData = useOutletContext();
  if (!profileData) return <Loading />;

  return (
    <>
      <div
        className="bg-white p-4 max-w-md flex flex-col mx-auto justify-center items-center "
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {profileData && profileData.picture ? (
          <img
            src={profileData.picture}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover mb-2"
          />
        ) : (
          <UserCircle size={200} />
        )}
        <h1 className="text-xl font-semibold mb-4">用戶資料</h1>
        <p className="mb-2">使用者名稱: {profileData.name}</p>
        <p className="mb-2">email: {profileData.email}</p>
        <p className="mb-2">
          {profileData.provider === 'native' ? '以帳號登入' : '第三方登入'}
        </p>
        <SignOutButton />
      </div>
    </>
  );
};

export default Profile;
