import { View, Text, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ModalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-2xl font-bold text-black mb-4">Modal Screen</Text>
          <Text className="text-gray-600 mb-8">ID: {id}</Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-primary-gold px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
