import { Link } from "@tanstack/react-router";

export const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-6">
      <div className="flex-1 flex items-center justify-center w-full">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-purple-800 drop-shadow-sm">
          StroyRun
        </h1>
      </div>

      <div className="mb-12">
        <Link
          to="/login"
          className="px-8 py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Start
        </Link>
      </div>
    </div>
  );
};
