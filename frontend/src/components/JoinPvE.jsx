import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function JoinPvE() {
    const handleClick = () => {
        toast.error("This feature is not available yet.");
    }

    return (
        <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 mb-4 transition-all duration-500 ease-in-out text-center hover:bg-white/1 active:bg-gray-400">
            <button
                onClick={handleClick}
                className="text-white text-center text-xl hover:text-gray-300 transition-colors w-full font-bold">
                Join PvE
            </button>
        </div>
    )
}

export default JoinPvE