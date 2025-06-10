import { View, Text, StatusBar as RNStatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

const AuthLayout = () => {
  useEffect(() => {
    RNStatusBar.setBarStyle('dark-content');
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen 
          name="sign-in"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="sign-up"
          options={{
            headerShown: false
          }}
        />
      </Stack>

      <StatusBar backgroundColor="#ffffff" style="dark" translucent={false} />
    </>
  );
};

export default AuthLayout;
