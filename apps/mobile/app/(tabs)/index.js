import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-gray-50 p-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6 mt-8">
                <View>
                    <Text className="text-gray-500 text-sm">Welcome back,</Text>
                    <Text className="text-2xl font-bold text-gray-900">John Doe</Text>
                </View>
                <TouchableOpacity
                    className="bg-blue-100 p-2 rounded-full"
                    onPress={() => router.push('/profile')}
                >
                    <Text className="text-blue-600 font-bold">JD</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View className="flex-row justify-between mb-6">
                <ActionButton label="Book Appointment" icon="📅" color="bg-blue-500" onPress={() => router.push('/(tabs)/appointments')} />
                <ActionButton label="Find Doctor" icon="👨‍⚕️" color="bg-emerald-500" />
                <ActionButton label="Reports" icon="📄" color="bg-purple-500" />
            </View>

            {/* Upcoming Appointment */}
            <Text className="text-lg font-bold mb-4">Upcoming Appointment</Text>
            <View className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-bold text-lg">Dr. Sharma</Text>
                    <Text className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">CONFIRMED</Text>
                </View>
                <Text className="text-gray-500 mb-2">Cardiology • Apollo Hospital</Text>
                <View className="flex-row mt-2">
                    <Text className="bg-gray-100 px-3 py-1 rounded mr-2 text-sm">Feb 24, 2026</Text>
                    <Text className="bg-gray-100 px-3 py-1 rounded text-sm">10:00 AM</Text>
                </View>
            </View>

            {/* Recent Activity */}
            <Text className="text-lg font-bold mb-4">Health Tips</Text>
            <View className="bg-orange-50 p-4 rounded-xl mb-4 border border-orange-100">
                <Text className="font-bold text-orange-800 mb-1">Stay Hydrated</Text>
                <Text className="text-orange-700 text-sm">Drink at least 8 glasses of water daily to maintain good health.</Text>
            </View>
        </ScrollView>
    );
}

function ActionButton({ label, icon, color, onPress }) {
    return (
        <TouchableOpacity className="items-center" onPress={onPress}>
            <View className={`${color} w-16 h-16 rounded-2xl items-center justify-center mb-2 shadow-sm`}>
                <Text className="text-2xl">{icon}</Text>
            </View>
            <Text className="text-xs font-semibold text-center w-20">{label}</Text>
        </TouchableOpacity>
    );
}
