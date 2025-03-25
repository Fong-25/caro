import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";

function Leaderboard() {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/leaderboard`, {
                    method: "GET",
                })
                const data = await response.json();
                if (response.ok) {
                    setLeaderboard(data);
                }
                else {
                    toast.error(data.error || "Something went wrong")
                    navigate('/login')
                }
            } catch (error) {
                console.error("Error: ", error);
                toast.error(`Error: ${error.message}`);
                navigate('/login');
            }
        }
        fetchLeaderboard();
    }, [navigate]);


    //todo: redesign UI
    return (
        <div className="bg-linear-to-r from-green-600 via-emerald-500 to-teal-500 min-h-screen relative p-6">
            <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 my-5">
                <h2 className="text-3xl font-bold text-emerald-300 text-center">Leaderboard</h2>
                <div className="grid grid-cols-1 gap-4 relative pt-2 mt-5">
                    {leaderboard.map((player, index) => (
                        <div key={player._id} className="bg-white/20 p-4 rounded-lg shadow-md border border-white/10">
                            <h3 className="text-xl font-bold text-white">#{index + 1} {player.username}</h3>
                            <p className="text-lg text-white">Elo: {player.elo}</p>
                        </div>
                    ))}
                </div>
            </div>
            <h3 className="text-center text-white text-2xl mb-5 font-bold absolute right-1/2 bottom-5 translate-x-1/2">Leaderboard</h3>
            <Toaster />
        </div>
    )
};

export default Leaderboard;