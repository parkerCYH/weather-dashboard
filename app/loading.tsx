import { Sun } from "lucide-react";
function Loading() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex flex-col items-center justify-center">
      <Sun className="h-24 w-24 animate-bounce text-blue-600" />
      <h1 className="text-6xl font-bold text-center mb-10 animate-pulse text-gray-900">
        {" "}
        Loading City Weather Information
      </h1>
      <h2 className="text-xl font-bold text-center mb-10 animate-pulse text-gray-600">
        Hold on, we are crunching the numbers & generating an AI summary of the
        Weather!
      </h2>{" "}
    </div>
  );
}
export default Loading;
