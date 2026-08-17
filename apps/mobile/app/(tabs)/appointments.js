import { View, Text, FlatList } from 'react-native';

const appointments = [
    { id: '1', date: '2026-02-24', time: '10:00 AM', doctor: 'Dr. Sharma', dept: 'Cardiology', status: 'Confirmed' },
    { id: '2', date: '2025-12-10', time: '04:30 PM', doctor: 'Dr. Gupta', dept: 'Dermatology', status: 'Completed' },
];

export default function AppointmentsScreen() {
    return (
        <View className="flex-1 bg-gray-50 p-4 pt-12">
            <Text className="text-2xl font-bold mb-6">Appointments</Text>

            <FlatList
                data={appointments}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
                        <View className="flex-row justify-between mb-2">
                            <Text className="font-bold text-lg">{item.doctor}</Text>
                            <Text className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                        <Text className="text-gray-500 text-sm mb-3">{item.dept}</Text>
                        <View className="flex-row border-t border-gray-100 pt-3">
                            <Text className="text-gray-600 mr-4">📅 {item.date}</Text>
                            <Text className="text-gray-600">🕒 {item.time}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
