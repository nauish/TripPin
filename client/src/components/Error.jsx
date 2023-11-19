import { Link } from 'react-router-dom';

export default function ErrorHandler({ error, message }) {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-white z-30">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{error} 錯誤！</h1>
        <p className="text-lg pb-6">{message || '抱歉，出錯了'}</p>
        <Link
          reloadDocument
          to="/"
          className="px-4 py-2 bg-gray-800 text-white font-bold rounded hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
        >
          回首頁
        </Link>
      </div>
    </div>
  );
}
