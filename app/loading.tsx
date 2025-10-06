import { Sun } from "lucide-react";
function Loading() {
  return (
    <div className="bg-gradient-to-br from-[#bd5656] to-[#e47070]  min-h-screen flex flex-col items-center justify-center text-slate-500">
      <Sun className="h-24 w-24 animate-bounce text-yellow-500" />
      <h1 className="text-6xl font-bold text-center mb-10 animate-pulse">
        {" "}
        Loading City Weather Information
      </h1>
      <h2 className="text-xl font-bold text-center mb-10 animate-pulse">
        Hold on, we are crunching the numbers & generating an AI summary of the
        Weather!
      </h2>{" "}
    </div>
  );
}
export default Loading;
