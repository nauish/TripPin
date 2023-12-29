const Loading = () => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center">
      <div className="w-20 h-20 border-t-4 border-black border-solid rounded-full animate-spin"></div>
      <h1 className="ml-2">載入中...</h1>
    </div>
  );
};

export default Loading;
