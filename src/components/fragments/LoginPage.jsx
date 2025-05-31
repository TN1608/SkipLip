import { useState } from "react";
import {Divider, Form, Input, message} from "antd";
import { motion } from "framer-motion";
import authServices from "@/services/AuthServices.js";

export const LoginPage = ({ onAuthSuccess }) => {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Hàm gửi OTP
    const sendOTP = async (phoneNumber) => {
        try{
            setLoading(true);
            const response = await authServices.sendOTP(phoneNumber);
            message.success(response.message);
            setStep(2);
        }catch (error) {
            console.error('Error sending OTP:', error);
            message.error('Failed to send OTP. Please try again.');
        }finally {
            setStep(2);
            setPhone(phoneNumber);
            setLoading(false);
        }
    };

    const verifyOTP = async (otpCode) => {
        try {
            setLoading(true);
            const response = await authServices.verifyOTP(phone, otpCode);
            onAuthSuccess(phone);
            message.success(response.message);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            message.error('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full h-screen bg-gradient-to-r from-purple-500 to-blue-500">
            <div className="flex flex-col relative items-center justify-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <div className="text-center">
                        <motion.h1
                            className="text-2xl font-bold mb-4"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Welcome to Skipli AI
                            </h1>
                        </motion.h1>
                    </div>
                    <motion.p
                        className="text-gray-600 mb-6 text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Please enter your phone number to receive an OTP for verification.
                    </motion.p>
                    <Divider />
                    <Form
                        layout="vertical"
                        onFinish={(values) => {
                            if (step === 1) {
                                sendOTP(values.phone);
                            } else {
                                verifyOTP(values.otp);
                            }
                        }}
                        className="space-y-4"
                    >
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4 }}
                        >
                            {step === 1 && (
                                <Form.Item
                                    label="Phone Number"
                                    name="phone"
                                    rules={[
                                        { required: true, message: 'Please enter your phone number!' },
                                        { pattern: /^\d{9,10}$/, message: 'Phone number must be 9 or 10 digits!' }
                                    ]}
                                >
                                    <Input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        className="w-full p-2 border rounded"
                                        onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                                        maxLength={10}
                                    />
                                </Form.Item>
                            )}
                            {step === 2 && (
                                <Form.Item
                                    label="OTP Code"
                                    name="otp"
                                    rules={[{ required: true, message: 'Please enter the OTP code!' }]}
                                >
                                    <Input.OTP
                                        placeholder="Enter the OTP code"
                                        className="w-full p-2 border rounded"
                                        onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ''))}
                                        maxLength={6}
                                    />
                                </Form.Item>
                            )}
                        </motion.div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (step === 1 ? 'Send OTP' : 'Verify OTP')}
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
};
