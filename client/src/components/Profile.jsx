import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';

const SignOutButton = () => {
  const navigate = useNavigate();

  const handleClearLocalStorage = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <button
      className="px-4 py-2 bg-gray-800 text-white font-bold rounded hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
      onClick={handleClearLocalStorage}
    >
      登出{' '}
    </button>
  );
};

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_HOST}api/v1/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.accessToken}`,
            },
          },
        );

        if (!response.ok) {
          localStorage.removeItem('accessToken');
          navigate('/auth');
          throw new Error('伺服器驗證Token無效，請重新登入');
        }

        const data = await response.json();
        setProfileData(data.data);
        setLoading(false);
      } catch (error) {
        console.error('擷取資料失敗:', error);
        setLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <div className="bg-white rounded-lg xl:shadow-md p-4 max-w-md flex flex-col mx-auto justify-center items-center">
        {profileData.picture ? (
          <img
            src={profileData.picture}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover mb-2"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="170"
            height="170"
            viewBox="0 0 340 340"
          >
            <path
              fill="#DDD"
              d="m169,.5a169,169 0 1,0 2,0zm0,86a76,76 0 1 1-2,0zM57,287q27-35 67-35h92q40,0 67,35a164,164 0 0,1-226,0"
            />
          </svg>
        )}
        <h1 className="text-xl font-semibold mb-4">用戶資料</h1>

        <p className="mb-2">使用者名稱: {profileData.name}</p>
        <p className="mb-2">Email: {profileData.email}</p>
        <p className="mb-2">
          {profileData.provider === 'native' ? '以帳號登入' : 'Facebook 登入'}
        </p>
        <SignOutButton />
      </div>
    </>
  );
};

export default Profile;
