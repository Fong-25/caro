import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast"; // Ensure import is correct
import { useNavigate } from "react-router-dom";
import PvE from '../components/JoinPvE';
import PvP from '../components/JoinPvP'

function Lobby() {

    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/auth/user`, { // update later
                    method: "GET",
                    credentials: "include", // Ensure session is sent
                });
                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.error || "Something went wrong");
                    navigate("/login"); // Redirect to login if not authenticated
                }
            } catch (error) {
                console.error("Error: ", error);
                toast.error("Error: " + error.message);
                navigate("/login"); // Redirect on error
            }
        };

        checkAuth();
    }, [navigate]);

    return (
        <div className="bg-linear-to-r from-green-600 via-emerald-500 to-teal-500 min-h-screen relative p-6">
            <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 my-5">
                <h2 className="text-3xl font-bold text-emerald-300 text-center">Lobby</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative pt-2 mt-5">
                    <PvE />
                    <PvP />
                </div>
            </div>
            <h3 className="text-center text-white text-2xl mb-5 font-bold absolute right-1/2 bottom-5 translate-x-1/2">Play here</h3>
            <Toaster />
        </div>
    )
}

export default Lobby