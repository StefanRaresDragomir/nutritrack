import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, Text, View } from "react-native";
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context'
import  CustomButton  from "../components/CustomButton"
import { useGlobalContext } from '../context/GlobalProvider';


import {images} from '../constants';


export default function App() {
  const {isLoading, isLoggedIn} = useGlobalContext();

  if(!isLoading && isLoggedIn) return <Redirect href="/profile"   />

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView contentContainerStyle={{ height: '100%'}}>
        <View className="w-full justify-center items-center min-h-[85vh] px-4">
          <Image
            source={images.nutritrack}
            className="w-[300px] h-[200px]"
            resizeMode="contain"
          />

        <CustomButton
          title="GET STARTED"
          handlePress={() => router.push('/sign-in')}
          containerStyles="w-full mt-7"
        />
        </View>
      </ScrollView>

      <StatusBar backgroundColor='#161622' style='dark'/>
    </SafeAreaView>
  );
}

