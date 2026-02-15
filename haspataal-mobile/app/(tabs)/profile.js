import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';

export default function ProfileScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await api.logout();
                    router.replace('/login');
                }
            }
        ]);
    };

    return (
        <View className="flex-1 bg-gray-50 p-4 pt-12">
            <Text className="text-2xl font-bold mb-6">Profile</Text>

            <View className="bg-white p-4 rounded-xl shadow-sm mb-6 flex-row items-center">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <Text className="text-blue-600 text-2xl font-bold">JD</Text>
                </View>
                <View>
                    <Text className="text-xl font-bold">John Doe</Text>
                    <Text className="text-gray-500">+91 98765 43210</Text>
                </View>
            </View>

            <View className="bg-white rounded-xl shadow-sm overflow-hidden">
                <MenuItem label="My Reports" icon="📄" />
                <MenuItem label="Linked ABHA" icon="🆔" />
                <MenuItem label="Family Members" icon="users" />
                <MenuItem label="Help & Support" icon="help-circle" />
            </View>

            <TouchableOpacity
                className="mt-6 bg-red-50 p-4 rounded-xl items-center border border-red-100"
                onPress={handleLogout}
            >
                <Text className="text-red-600 font-bold">Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

function MenuItem({ label, icon }) {
    return (
        <TouchableOpacity className="p-4 border-b border-gray-100 flex-row items-center">
            <Text className="mr-3">{icon}</Text>
            <Text className="flex-1 text-gray-700 text-lg">{label}</Text>
            <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
    );
}
