import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api } from '../lib/api';

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }
        setLoading(true);
        // In a real app, we'd trigger an API to send OTP. 
        // For MVP/Demo, we simulate it or use a fixed OTP.
        setTimeout(() => {
            setLoading(false);
            setStep('otp');
            Alert.alert('OTP Sent', 'Use 123456 for demo');
        }, 1000);
    };

    const handleVerifyOtp = async () => {
        if (otp !== '123456') {
            Alert.alert('Error', 'Invalid OTP');
            return;
        }
        setLoading(true);

        // Simulate backend login/verify
        // In production: const res = await api.post('/auth/login', { phone, otp });

        setTimeout(async () => {
            setLoading(false);
            // Mock token for now
            await api.setToken('mock-jwt-token');
            router.replace('/(tabs)');
        }, 1000);
    };

    return (
        <View className="flex-1 bg-white justify-center px-6">
            <View className="mb-10">
                <Text className="text-3xl font-bold text-blue-600 mb-2">Haspataal</Text>
                <Text className="text-gray-500 text-base">Your Health, Our Priority</Text>
            </View>

            {step === 'phone' ? (
                <>
                    <Text className="text-lg font-semibold mb-4">Login to continue</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-4 mb-4 text-lg"
                        placeholder="Mobile Number"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                    <TouchableOpacity
                        className="bg-blue-600 rounded-lg p-4 items-center"
                        onPress={handleSendOtp}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Send OTP</Text>}
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text className="text-lg font-semibold mb-4">Enter OTP</Text>
                    <Text className="text-gray-500 mb-6">Sent to +91 {phone}</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-4 mb-4 text-lg text-center tracking-widest"
                        placeholder="######"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                    />
                    <TouchableOpacity
                        className="bg-blue-600 rounded-lg p-4 items-center"
                        onPress={handleVerifyOtp}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Verify & Login</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity className="mt-4 items-center" onPress={() => setStep('phone')}>
                        <Text className="text-blue-600">Change Phone Number</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}
