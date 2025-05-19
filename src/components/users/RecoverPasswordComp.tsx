'use client'
import {useSearchParams} from "next/navigation";
import {useState} from "react";
import {api} from "@/lib";

export default function RecoverPasswordComp() {
    const params = useSearchParams();
    const token = params.get('token');
    const email = params.get('email');

    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const sendRecoverPassword = async () => {
        if (!token || !email) {
            setError("Invalid recovery link.");
            return;
        }

        if (password !== password2) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            await api.auth.recoverPassword(email, token, password);
            setMessage("Your password has been successfully updated.");
            setError('');
        } catch (e) {
            setError("An error occurred while resetting your password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-md">
            <h1 className="text-xl font-semibold mb-4">Reset Password</h1>

            {message && <div className="text-green-600 mb-2">{message}</div>}
            {error && <div className="text-red-600 mb-2">{error}</div>}

            <input
                type="password"
                placeholder="New password"
                className="w-full mb-3 p-2 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirm new password"
                className="w-full mb-4 p-2 border rounded"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
            />

            <button
                onClick={sendRecoverPassword}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
                {loading ? "Submitting..." : "Reset Password"}
            </button>
        </div>
    );
}