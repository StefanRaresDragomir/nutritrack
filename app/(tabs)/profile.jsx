import { ID } from 'appwrite';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { config, account, databases, avatars, storage } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import AvatarUpload from '../../components/AvatarUpload';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown, FadeOutDown, ZoomIn, FadeOut, FadeIn } from 'react-native-reanimated';
import { icons } from '../../constants';
import { Image } from 'react-native';
import { ScrollView } from 'react-native';   
import { Permission, Role } from 'appwrite';
import { SafeAreaView } from 'react-native';
import { Platform, StatusBar } from 'react-native';
import CustomMacroGoalForm from '../../components/CustomMacroGoalForm';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalContext } from '../../context/GlobalProvider';




const extractFileId = (url) => {
  const match = url.match(/files\/([a-zA-Z0-9-_]+)\/preview/);
  return match ? match[1] : null;
};



const Profile = () => {
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
 
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '' });
  
  const [isProcessing, setIsProcessing] = useState(false);

  const [showCustomGoal, setShowCustomGoal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [caloriesPreview, setCaloriesPreview] = useState({ lose: 0, maintain: 0, gain: 0 });
  

  const [showStatsModal, setShowStatsModal] = useState(false);

  const { setUserGoal, setRefreshGoals } = useGlobalContext();


const [showAnimated, setShowAnimated] = useState(false);

useFocusEffect(
  useCallback(() => {
    setShowAnimated(false);
    const timeout = setTimeout(() => setShowAnimated(true), 10);
    return () => clearTimeout(timeout);
  }, [])
);



const [statsForm, setStatsForm] = useState({
  gender: userDoc?.gender || 'male',
  age: userDoc?.age?.toString() || '',
  height: userDoc?.height?.toString() || '',
  weight: userDoc?.weight?.toString() || '',
});


  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await account.get();
        const userId = session.$id;

        const response = await databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('accountId', userId)]
        );

        if (response.documents.length > 0) {
          const user = response.documents[0];
          setUserDoc(user);

          
        } else {
          Alert.alert('Error', 'User document not found.');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        Alert.alert('Error', 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleAvatarUpdate = async (fileId) => {
    if (!userDoc) return;
  
    try {
      const updated = await databases.updateDocument(
        config.databaseId,
        config.userCollectionId,
        userDoc.$id,
        { avatar: fileId } 
      );
      setUserDoc(updated);
    } catch (error) {
      const msg = error?.message?.toLowerCase() || '';
      const isHarmless = msg.includes('not found') || msg.includes('could not be found');
  
      if (!isHarmless) {
        Alert.alert('Error', 'Could not update avatar.');
      } else {
        console.log('Ignored harmless avatar update error.');
      }
    }
  };
  

  

  const handleChangeEmail = async () => {
    if (!emailForm.email || !emailForm.password) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    setIsProcessing(true);
    try {
      await account.updateEmail(emailForm.email, emailForm.password);
      Alert.alert('Success', 'Email updated successfully!');
      setShowEmailModal(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername) {
      return Alert.alert('Error', 'Please enter a username.');
    }
    setIsProcessing(true);
    try {
      await account.updateName(newUsername);
      const updated = await databases.updateDocument(
        config.databaseId,
        config.userCollectionId,
        userDoc.$id,
        { username: newUsername }
      );
      setUserDoc(updated);
      Alert.alert('Success', 'Username updated!');
      setShowUsernameModal(false);
    } catch (error) {
      console.error('Failed to change username:', error);
      Alert.alert('Error', 'Could not change username.');
    } finally {
      setIsProcessing(false);
    }
  };
  

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    setIsProcessing(true);
    try {
      await account.updatePassword(passwordForm.new, passwordForm.current);
      Alert.alert('Success', 'Password updated successfully!');
      setShowPasswordModal(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await databases.deleteDocument(
        config.databaseId,
        config.userCollectionId,
        userDoc.$id
      );
    } catch (error) {
      const msg = error?.message?.toLowerCase() || '';
      if (!msg.includes('could not be found')) {
        console.error('Failed to delete userDoc:', error);
        Alert.alert('Error', 'Failed to delete your account data.');
        return;
      }
      console.log('UserDoc already missing, skipping.');
    }
  
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.log('Session already invalid, skipping logout.');
    }
  
    Alert.alert('Account Deleted', 'Your account was deleted.');
    router.replace('/sign-in');
  };
  

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to permanently delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDeleteAccount 
        }
      ]
    );
  };

  const getActivityLevelColor = (level) => {
  switch (level) {
    case 'sedentary':
      return 'bg-red-600'; 
    case 'light':
      return 'bg-orange-500';
    case 'moderate':
      return 'bg-yellow-400';
    case 'active':
      return 'bg-lime-400';
    case 'very_active':
      return 'bg-green-500';
    case 'extra_active':
      return 'bg-green-600'; 
    default:
      return 'bg-gray-700';
  }
};



  const saveGoal = async (goalType, calories) => {
  try {
    let protein, fat, carbs;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (goalType === 'lose') {
      protein = userDoc.weight * 2.2;
      fat = Math.max(50, 0.25 * calories / 9);
    } else if (goalType === 'maintain') {
      protein = userDoc.weight * 2.0;
      fat = 0.25 * calories / 9;
    } else if (goalType === 'gain') {
      protein = userDoc.weight * 2.1;
      fat = 0.25 * calories / 9;
    }

    const proteinKcal = protein * 4;
    const fatKcal = fat * 9;
    carbs = (calories - (proteinKcal + fatKcal)) / 4;

    const roundedGoal = {
      goalType,
      calories,
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs),
      createdAt: new Date().toISOString(),
      startDate: new Date().toISOString()
    };

    
    const res = await databases.listDocuments(
      config.databaseId,
      config.goalsCollectionId,
      [Query.equal('userId', userDoc.$id)]
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    for (const doc of res.documents) {
      const goalDate = new Date(doc.startDate);
      if (goalDate >= todayStart && goalDate <= todayEnd) {
        await databases.deleteDocument(
          config.databaseId,
          config.goalsCollectionId,
          doc.$id
        );
      }
    }

    
    await databases.createDocument(
      config.databaseId,
      config.goalsCollectionId,
      ID.unique(),
      {
        userId: userDoc.$id,
        ...roundedGoal
      },
      [
        Permission.read(Role.user(userDoc.accountId)),
        Permission.update(Role.user(userDoc.accountId)),
        Permission.delete(Role.user(userDoc.accountId))
      ]
    );

    setUserGoal({
      calories,
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs)
    });

    setRefreshGoals(prev => !prev);

    Alert.alert('Success', 'Goal saved successfully!');
    setShowGoalModal(false);
  } catch (error) {
    console.error('Failed to save goal:', error);
    Alert.alert('Error', 'Could not save goal.');
  }
};





const saveCustomGoal = async ({ calories, protein, carbs, fat }) => {
  try {
    const roundedProtein = Math.round((protein / 100) * calories / 4);
    const roundedCarbs = Math.round((carbs / 100) * calories / 4);
    const roundedFat = Math.round((fat / 100) * calories / 9);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    
    const res = await databases.listDocuments(
      config.databaseId,
      config.goalsCollectionId,
      [Query.equal('userId', userDoc.$id)]
    );

    for (const doc of res.documents) {
      const goalDate = new Date(doc.startDate);
      if (goalDate >= todayStart && goalDate <= todayEnd) {
        await databases.deleteDocument(
          config.databaseId,
          config.goalsCollectionId,
          doc.$id
        );
      }
    }

    const goalData = {
      goalType: 'custom',
      calories,
      protein: roundedProtein,
      carbs: roundedCarbs,
      fat: roundedFat,
      createdAt: new Date().toISOString(),
      startDate: new Date().toISOString()
    };

    await databases.createDocument(
      config.databaseId,
      config.goalsCollectionId,
      ID.unique(),
      {
        userId: userDoc.$id,
        ...goalData
      },
      [
        Permission.read(Role.user(userDoc.accountId)),
        Permission.update(Role.user(userDoc.accountId)),
        Permission.delete(Role.user(userDoc.accountId))
      ]
    );

    setUserGoal({
      calories,
      protein: roundedProtein,
      carbs: roundedCarbs,
      fat: roundedFat
    });

    setRefreshGoals(prev => !prev);


    Alert.alert('Success', 'Custom goal saved!');
    setShowCustomGoal(false);
    setShowGoalModal(false);
  } catch (err) {
    console.error('Failed to save custom goal:', err);
    Alert.alert('Error', 'Could not save custom goal.');
  }
};



  useEffect(() => {
  if (userDoc) {
    const bmr = userDoc.gender === 'male'
      ? 10 * userDoc.weight + 6.25 * userDoc.height - 5 * userDoc.age + 5
      : 10 * userDoc.weight + 6.25 * userDoc.height - 5 * userDoc.age - 161;

    const activityMap = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
      extra_active: 2.05
    };
    const activityFactor = activityMap[userDoc.activitylevel] || 1.2;
    const tdee = bmr * activityFactor;

    setCaloriesPreview({
      lose: Math.round(tdee - 800),      
      maintain: Math.round(tdee - 400),  
      gain: Math.round(tdee - 0)       
    });
  }
}, [userDoc]);

  

  if (loading || !userDoc) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }

 return (
  <View style={{ flex: 1 }}>
  {showAnimated ? (
    <Animated.View
      entering={FadeInUp.duration(500)}
      exiting={FadeOutDown.duration(400)}
      style={{ flex: 1, padding: 24, justifyContent: 'space-between' }}
    >

  
  <View>
    <Animated.View entering={FadeIn.delay(300).duration(100)} style={{ marginBottom: 32 }}>
      <AvatarUpload
        username={userDoc.username}
        avatarFileId={userDoc.avatar?.startsWith('http') ? null : userDoc.avatar}
        onUpload={handleAvatarUpdate}
      />
    </Animated.View>

    <Animated.View entering={FadeInUp.delay(200).duration(500)}>
      <CustomButton title="Stats" containerStyles="mt-4 bg-green-600" textStyles="text-white" handlePress={() => setShowStatsModal(true)} />
      <CustomButton title="GOALS" containerStyles="mt-4 bg-yellow-400 border border-black" textStyles="text-black" handlePress={() => setShowGoalModal(true)} />
      <CustomButton title="Change Username" containerStyles="mt-4 bg-secondary" textStyles="text-white" handlePress={() => setShowUsernameModal(true)} />
      <CustomButton title="Change Email" containerStyles="mt-4 bg-secondary" textStyles="text-white" handlePress={() => setShowEmailModal(true)} />
      <CustomButton title="Change Password" containerStyles="mt-4 bg-secondary" textStyles="text-white" handlePress={() => setShowPasswordModal(true)} />
      

      <View className="items-center mt-16">
        <Pressable
          onPress={async () => {
            try {
              await account.deleteSession('current');
              router.replace('/sign-in');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to logout.');
            }
          }}
        >
          <Image
            source={icons.logout}
            style={{ width: 50, height: 50, tintColor: 'red' }}  
            resizeMode="contain"  
          />
        </Pressable>
      </View>
    </Animated.View>
  </View>

  <Animated.View entering={FadeInDown.delay(200).duration(500)}>
    <CustomButton
      title="Delete My Account"
      containerStyles="bg-red-600"
      textStyles="text-white"
      handlePress={confirmDeleteAccount}
    />
  </Animated.View>




      

     
      <Modal visible={showUsernameModal} animationType="slide">
        <View className="flex-1 justify-center px-6 bg-secondary">
          <Animated.View entering={FadeInUp.duration(400)}>
            <FormField
              title="New Username"
              value={newUsername}
              handleChangeText={setNewUsername}
            />
            <CustomButton
              title="Update Username"
              handlePress={handleChangeUsername}
              isLoading={isProcessing}
              containerStyles="mt-16 bg-white"
            />
            <CustomButton
              title="Cancel"
              handlePress={() => setShowUsernameModal(false)}
              containerStyles="mt-3"
            />
          </Animated.View>
        </View>
      </Modal>

      
      <Modal visible={showEmailModal} animationType="slide">
        <View className="flex-1 justify-center px-6 bg-secondary">
          <Animated.View entering={FadeInUp.duration(400)}>
            <FormField title="New Email" value={emailForm.email} handleChangeText={(e) => setEmailForm({ ...emailForm, email: e })} />
            <FormField title="Current Password" value={emailForm.password} secureTextEntry handleChangeText={(e) => setEmailForm({ ...emailForm, password: e })} otherStyles="mt-5" />
            <CustomButton title="Update Email" handlePress={handleChangeEmail} isLoading={isProcessing} containerStyles="mt-16 bg-white" />
            <CustomButton title="Cancel" handlePress={() => setShowEmailModal(false)} containerStyles="mt-3" />
          </Animated.View>
        </View>
      </Modal>

     
      <Modal visible={showPasswordModal} animationType="slide">
        <View className="flex-1 justify-center px-6 bg-secondary">
          <Animated.View entering={FadeInUp.duration(400)}>
            <FormField title="Current Password" value={passwordForm.current} secureTextEntry handleChangeText={(e) => setPasswordForm({ ...passwordForm, current: e })} />
            <FormField title="New Password" value={passwordForm.new} secureTextEntry handleChangeText={(e) => setPasswordForm({ ...passwordForm, new: e })} otherStyles="mt-5" />
            <CustomButton title="Update Password" handlePress={handleChangePassword} isLoading={isProcessing} containerStyles="mt-16 bg-white" />
            <CustomButton title="Cancel" handlePress={() => setShowPasswordModal(false)} containerStyles="mt-3" />
          </Animated.View>
        </View>
      </Modal>



      <Modal visible={showStatsModal} animationType="slide">
  <SafeAreaView className="flex-1 bg-secondary">
  <ScrollView contentContainerStyle={{ padding: 24 }}>
  <Animated.View entering={FadeInUp.duration(400)} className="w-full">
    
    <View className="items-center mb-6">
      <Text className="text-white text-lg font-bold mb-1">Previous Stats</Text>
      {userDoc?.gender === 'male' ? (
        <Image
          source={icons.msymbol}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
      ) : userDoc?.gender === 'female' ? (
        <Image
          source={icons.fsymbol}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
      ) : (
        <Text className="text-white">N/A</Text>
      )}
      <Text className="text-white">Age - {userDoc?.age ?? 'N/A'}</Text>
      <Text className="text-white">Height - {userDoc?.height ?? 'N/A'} cm</Text>
      <Text className="text-white">Weight - {userDoc?.weight ?? 'N/A'} kg</Text>
      <Text className="text-white">Activity level - {userDoc?.activitylevel ?? 'N/A'}</Text>
    </View>
   
      
      <FormField
        title="Age"
        value={statsForm.age}
        handleChangeText={(e) => {
          const sanitized = e.replace(/[^0-9]/g, '');
          setStatsForm({ ...statsForm, age: sanitized });
        }}
        keyboardType="numeric"
        otherStyles="mb-4"
      />
      <FormField
        title="Height (cm)"
        value={statsForm.height}
        handleChangeText={(e) => {
          const sanitized = e.replace(/[^0-9.,]/g, '').replace(',', '.');
          setStatsForm({ ...statsForm, height: sanitized });
        }}
        keyboardType="numeric"
        otherStyles="mb-4"
      />
      <FormField
        title="Weight (kg)"
        value={statsForm.weight}
        handleChangeText={(e) => {
          const sanitized = e.replace(/[^0-9.,]/g, '').replace(',', '.');
          setStatsForm({ ...statsForm, weight: sanitized });
        }}
        keyboardType="numeric"
        otherStyles="mb-4"
      />

      <View className="flex-row justify-around mt-4">
  <Pressable
    onPress={() => setStatsForm({ ...statsForm, gender: 'male' })}
    className={`px-4 py-2 rounded-md ${statsForm.gender === 'male' ? 'bg-blue-800' : 'bg-gray-700'}`}
  >
    <Image
      source={icons.msymbol}
      style={{ width: 40, height: 40, tintColor: 'white' }}  
      resizeMode="contain"
    />
  </Pressable>
  <Pressable
    onPress={() => setStatsForm({ ...statsForm, gender: 'female' })}
    className={`px-4 py-2 rounded-md ${statsForm.gender === 'female' ? 'bg-pink-600' : 'bg-gray-700'}`}
  >
    <Image
      source={icons.fsymbol}
      style={{ width: 40, height: 40, tintColor: 'white' }}  
      resizeMode="contain"
    />
  </Pressable>
</View>

 <Text className="text-white text-lg font-bold mt-4 mb-2">Activity Level</Text>
    <View className="w-full">
      {[
        { label: 'Sedentary - little or no exercise', value: 'sedentary' },
        { label: 'Light - exercise 1-3 times/week', value: 'light' },
        { label: 'Moderate - exercise 4-5 times/week', value: 'moderate' },
        { label: 'Active - daily exercise or intense exercise 3-4 times/week', value: 'active' },
        { label: 'Very Active - intense exercise 6-7 times/week', value: 'very_active' },
        { label: 'Extra Active - very intense exercise daily or physical job', value: 'extra_active' }
      ].map((opt) => (
        <Pressable
  key={opt.value}
  onPress={() => setStatsForm({ ...statsForm, activitylevel: opt.value })}
  className={`px-4 py-2 rounded-md my-1 ${
    statsForm.activitylevel === opt.value
      ? getActivityLevelColor(opt.value)
      : 'bg-gray-700'
  }`}
>
  <Text className="text-white">{opt.label}</Text>
</Pressable>
      ))}
    </View>

      <CustomButton
        title="Save Stats"
        handlePress={async () => {
          if (
            isNaN(parseInt(statsForm.age)) ||
            isNaN(parseFloat(statsForm.height)) ||
            isNaN(parseFloat(statsForm.weight))
          ) {
            return Alert.alert('Error', 'Please enter valid numbers for age, height, and weight.');
          }

            if (!statsForm.activitylevel) {
      return Alert.alert('Error', 'Please select an activity level.');
    }

          try {
            const updated = await databases.updateDocument(
              config.databaseId,
              config.userCollectionId,
              userDoc.$id,
              {
                gender: statsForm.gender,
                age: parseInt(statsForm.age),
                height: parseFloat(statsForm.height),
                weight: parseFloat(statsForm.weight),
                activitylevel: statsForm.activitylevel,
              }
            );
            setUserDoc(updated);
            Alert.alert('Success', 'Stats updated!');
            setShowStatsModal(false);
          } catch (err) {
            console.error('Failed to save stats:', err);
            Alert.alert('Error', 'Could not save stats.');
          }
        }}
        containerStyles="mt-6 bg-white"
      />
      <CustomButton
        title="Back"
        handlePress={() => setShowStatsModal(false)}
        containerStyles="mt-3"
      />
    </Animated.View>
    </ScrollView>
  </SafeAreaView>
</Modal>


<Modal visible={showGoalModal} animationType="slide">
  <View style={{ flex: 1, backgroundColor: 'white' }}>

    <View style={{
  position: 'relative',
  backgroundColor: '#FFD700',
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 70,
  paddingBottom: 15,
  borderBottomWidth: 2,
  borderColor: 'black',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  width: '100%',
  zIndex: 1
}}>
  <Pressable onPress={() => setShowGoalModal(false)}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>X</Text>
  </Pressable>

  <Animated.View entering={FadeInUp.duration(1000)} style={{ flex: 1 }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center', flex: 1 }}>
    GOALS
  </Text>
  </Animated.View>

  <View style={{ width: 20 }} />
</View>


    <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>I want to:</Text>

      <Pressable
  onPress={() => {
    if (!userDoc.age || !userDoc.height || !userDoc.weight || !userDoc.activitylevel) {
      return Alert.alert('Error', 'Please complete your stats before setting a goal.');
    }
    saveGoal('lose', caloriesPreview.lose);
  }}
  style={{ backgroundColor: '#e0ffe0', padding: 15, marginVertical: 5, borderRadius: 8 }}
>
  <Text style={{ color: 'green', fontWeight: 'bold' }}>Lose weight</Text>
  <Text>With a caloric intake of ~ {caloriesPreview.lose} kcal</Text>
</Pressable>

<Pressable
  onPress={() => {
    if (!userDoc.age || !userDoc.height || !userDoc.weight || !userDoc.activitylevel) {
      return Alert.alert('Error', 'Please complete your stats before setting a goal.');
    }
    saveGoal('maintain', caloriesPreview.maintain);
  }}
  style={{ backgroundColor: '#e0f0ff', padding: 15, marginVertical: 5, borderRadius: 8 }}
>
  <Text style={{ color: 'blue', fontWeight: 'bold' }}>Maintain</Text>
  <Text>With a caloric intake of ~ {caloriesPreview.maintain} kcal</Text>
</Pressable>

<Pressable
  onPress={() => {
    if (!userDoc.age || !userDoc.height || !userDoc.weight || !userDoc.activitylevel) {
      return Alert.alert('Error', 'Please complete your stats before setting a goal.');
    }
    saveGoal('gain', caloriesPreview.gain);
  }}
  style={{ backgroundColor: '#ffe0e0', padding: 15, marginVertical: 5, borderRadius: 8 }}
>
  <Text style={{ color: 'red', fontWeight: 'bold' }}>Gain weight</Text>
  <Text>With a caloric intake of ~ {caloriesPreview.gain} kcal</Text>
</Pressable>


      <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 30, marginBottom: 10 }}>
        or...
      </Text>

      <CustomMacroGoalForm
        onSave={saveCustomGoal}
        onCancel={() => setShowGoalModal(false)}
      />

      <CustomButton
        title="Back"
        handlePress={() => setShowGoalModal(false)}
        
      />
    </ScrollView>
  </View>

</Modal>


</Animated.View>
  ) : (
    <View style={{ flex: 1, opacity: 0 }} />
  )}
</View>

      
  );

  
};


export default Profile;

