import { SplashScreen, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";
import "../global.css";
import { useEffect } from "react";
import GlobalProvider from '../context/GlobalProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    // Poppins
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  
    // Open Sans
    "OpenSans-Light": require("../assets/fonts/OpenSans-Light.ttf"),
    "OpenSans-LightItalic": require("../assets/fonts/OpenSans-LightItalic.ttf"),
    "OpenSans-Regular": require("../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-Italic": require("../assets/fonts/OpenSans-Italic.ttf"),
    "OpenSans-Semibold": require("../assets/fonts/OpenSans-Semibold.ttf"),
    "OpenSans-SemiboldItalic": require("../assets/fonts/OpenSans-SemiboldItalic.ttf"),
    "OpenSans-Bold": require("../assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-BoldItalic": require("../assets/fonts/OpenSans-BoldItalic.ttf"),
    "OpenSans-ExtraBold": require("../assets/fonts/OpenSans-ExtraBold.ttf"),
    "OpenSans-ExtraBoldItalic": require("../assets/fonts/OpenSans-ExtraBoldItalic.ttf"),
  
    // Nunito
    "Nunito-Light": require("../assets/fonts/Nunito-Light.ttf"),
    "Nunito-LightItalic": require("../assets/fonts/Nunito-LightItalic.ttf"),
    "Nunito-Regular": require("../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Italic": require("../assets/fonts/Nunito-Italic.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-SemiBoldItalic": require("../assets/fonts/Nunito-SemiBoldItalic.ttf"),
    "Nunito-Bold": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-BoldItalic": require("../assets/fonts/Nunito-BoldItalic.ttf"),
    "Nunito-ExtraLight": require("../assets/fonts/Nunito-ExtraLight.ttf"),
    "Nunito-ExtraLightItalic": require("../assets/fonts/Nunito-ExtraLightItalic.ttf"),
    "Nunito-ExtraBold": require("../assets/fonts/Nunito-ExtraBold.ttf"),
    "Nunito-ExtraBoldItalic": require("../assets/fonts/Nunito-ExtraBoldItalic.ttf"),
    "Nunito-Black": require("../assets/fonts/Nunito-Black.ttf"),
    "Nunito-BlackItalic": require("../assets/fonts/Nunito-BlackItalic.ttf"),
  
    // Inter
    "Inter-Thin": require("../assets/fonts/Inter-Thin-BETA.otf"),
    "Inter-ThinItalic": require("../assets/fonts/Inter-ThinItalic-BETA.otf"),
    "Inter-Light": require("../assets/fonts/Inter-Light-BETA.otf"),
    "Inter-LightItalic": require("../assets/fonts/Inter-LightItalic-BETA.otf"),
    "Inter-ExtraLight": require("../assets/fonts/Inter-ExtraLight-BETA.otf"),
    "Inter-ExtraLightItalic": require("../assets/fonts/Inter-ExtraLightItalic-BETA.otf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.otf"),
    "Inter-Italic": require("../assets/fonts/Inter-Italic.otf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.otf"),
    "Inter-MediumItalic": require("../assets/fonts/Inter-MediumItalic.otf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.otf"),
    "Inter-SemiBoldItalic": require("../assets/fonts/Inter-SemiBoldItalic.otf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.otf"),
    "Inter-BoldItalic": require("../assets/fonts/Inter-BoldItalic.otf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter-ExtraBold.otf"),
    "Inter-ExtraBoldItalic": require("../assets/fonts/Inter-ExtraBoldItalic.otf"),
    "Inter-Black": require("../assets/fonts/Inter-Black.otf"),
    "Inter-BlackItalic": require("../assets/fonts/Inter-BlackItalic.otf"),
  });
  
  
  useEffect(() => {
    if (error) throw error;
  
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);
  
  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <GlobalProvider>

    <Stack>
      <Stack.Screen name="index" options={{ headerShown:false}} />
      <Stack.Screen name="(auth)" options={{ headerShown:false}} />
      <Stack.Screen name="(tabs)" options={{ headerShown:false}} />
      {/* <Stack.Screen name="search/[query]" options={{ headerShown: false }} /> */}

    </Stack>

    </GlobalProvider>
    </GestureHandlerRootView>
  )
}
  
export default RootLayout

