import { useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

function SignUp() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    })

    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // if (!!formData.username && !!formData.email && !!formData.password) {
        //     toast.error("Please fill in all fields");
        // }
        try {
            const response = await fetch(`http://localhost:3000/api/auth/signup`, { //update later
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Account created! Login to continue.");
                setFormData({ username: "", email: "", password: "" }); // Clear form
                navigate("/login"); // Redirect to dashboard
            } else {
                toast.error(data.error || "Failed to create account");
            }
        } catch (error) {
            toast.error("Error signing up: " + error.message);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-green-600 via-emerald-500 to-teal-500 p-6">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
                <h2 className="text-3xl font-bold text-white text-center">Sign Up</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                            placeholder="Username"
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                            placeholder="Email"
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                            placeholder="Password"
                        />
                    </div>

                    <div className="flex items-center justify-center">
                        <input
                            id="showPassword"
                            name="showPassword"
                            type="checkbox"
                            checked={showPassword}
                            onChange={toggleShowPassword}
                            className="h-4 w-4 bg-black/50 border-gray-600 rounded focus:ring-white/50"
                        />
                        <label
                            htmlFor="showPassword"
                            className="ml-2 block text-sm text-gray-800"
                        >
                            Show password
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 ease-in-out"
                    >
                        Sign Up
                    </button>

                    <div className="text-center text-sm text-gray-800">
                        Already have an account?{" "}
                        <a href="/login" className="font-medium text-white hover:text-gray-300 transition-colors">
                            Log in
                        </a>
                    </div>
                </form>
            </div>
            <Toaster />
        </div>
    );
}

export default SignUp;