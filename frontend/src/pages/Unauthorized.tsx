const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 via-white to-gray-200 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-100">
        
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86l-8.2 14A1.5 1.5 0 003.3 20h17.4a1.5 1.5 0 001.21-2.14l-8.2-14a1.5 1.5 0 00-2.42 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          403 - Unauthorized
        </h1>

        <p className="text-gray-500 mb-6">
          You do not have permission to access this page.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition"
          >
            Go Back
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-100 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;