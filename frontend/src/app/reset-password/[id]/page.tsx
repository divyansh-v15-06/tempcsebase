'use client'
import React, { useEffect, useState } from 'react';
import { useParams,useRouter } from 'next/navigation';


const ResetPassword = () => {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [loading, setLoading] = useState(true); // Loader state
    const { id } = useParams<{ id: string }>();
    const Router = useRouter();

    useEffect(() => {
        setToken(id);
        // @ts-ignore
        validateToken(id);
    }, []);

    const validateToken = async (id) => {
        console.log("token", token);
        setLoading(true); // Set loading to true
       if(id){
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-token`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${id}`,
                }
            });

            if (!response.ok) {
                throw new Error('Token validation failed');
            }

            const data = await response.json();
            if (data.success) {
                setResponseMessage('Token validated successfully! Please enter your new password.');
            } else {
                setResponseMessage('Invalid token. Please try again.');
            }
        } catch (error) {
            setResponseMessage('Request timed out. Please try again later.');
            console.error('Error:', error);
        } finally {
            setLoading(false); // Set loading to false
        }
       }
    };

    const updatePassword = async (event) => {
        event.preventDefault(); // Prevent form submission
        setLoading(true); // Set loading to true

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ newPassword })
            });

            if (response.ok) {
                setResponseMessage('Password updated successfully!');
                Router.push('/login');
                
            } else {
                setResponseMessage('Error updating password.');
            }
        } catch (error) {
            setResponseMessage('Request timed out. Please try again later.');
            console.error('Error:', error);
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Reset Password</h1>
                
                {responseMessage && (
                    <div className={`p-4 rounded-lg mb-6 text-center ${
                        responseMessage.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {responseMessage}
                    </div>
                )}

                {/* Loader Indicator */}
                {loading ? (
                    <div className="flex justify-center mb-4">
                        <div className="loader">Loading...</div> {/* You can replace this with a spinner */}
                    </div>
                ) : responseMessage.includes('successfully') ? (
                    <form onSubmit={updatePassword}>
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                            Update Password
                        </button>
                    </form>
                ) : null}
            </div>
        </div>
    );
};

export default ResetPassword;
