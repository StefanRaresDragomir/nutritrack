import { View, Text, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { Link, router, useRouter } from 'expo-router';
import { createUser } from '../../lib/appwrite';
import CustomButton from '../../components/CustomButton';
import { useGlobalContext } from '../../context/GlobalProvider';
import { databases, config } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { getCurrentUser } from '../../lib/appwrite';



const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const { setUser, setIsLoggedIn, setUserGoal } = useGlobalContext();


  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
  if (!form.username || !form.email || !form.password) {
    Alert.alert('Error', 'Please fill in all the fields');
    return;
  }

  setIsSubmitting(true);

  try {
    const result = await createUser(form.email, form.password, form.username);

    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setIsLoggedIn(true);

   
    const res = await databases.listDocuments(
      config.databaseId,
      config.goalsCollectionId,
      [Query.equal('userId', currentUser.$id)]
    );

    if (res.total > 0) {
      const goal = res.documents[0];
      setUserGoal({
        calories: goal.calories,
        protein: goal.protein,
        carbs: goal.carbs,
        fat: goal.fat,
      });
    } else {
      setUserGoal(null);
    }

    router.replace('/profile');
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <SafeAreaView className="bg-secondary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4">
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">Sign up to NutriTrack</Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            isLoading={isSubmitting}
            containerStyles="mt-7 bg-white"
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">Have an account already?</Text>
            <Link href="/sign-in" className="text-lg font-psemibold text-primary">Sign In</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
