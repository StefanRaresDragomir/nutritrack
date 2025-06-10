import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import CustomButton from './CustomButton';
import MacroPicker from './MacroPicker';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';

const CustomMacroGoalForm = ({ onSave, onCancel }) => {
  const [calories, setCalories] = useState(2000);
  const [macros, setMacros] = useState({ protein: 40, carbs: 40, fat: 20 });

  const macroGrams = {
  protein: Math.round((macros.protein / 100) * calories / 4),
  carbs: Math.round((macros.carbs / 100) * calories / 4),
  fat: Math.round((macros.fat / 100) * calories / 9),
};


  const totalPercent = macros.protein + macros.carbs + macros.fat;
  const isValid = calories > 0 && totalPercent === 100;

  const updateMacro = (key, newValue) => {
    setMacros((prev) => ({ ...prev, [key]: newValue }));
  };

  return (
    <View
      style={{
        width: '100%',
        borderRadius: 20,
        backgroundColor: '#C0C0C0',
        paddingVertical: 24,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        marginTop: 20,
      }}
    >

      <Animated.View
  entering={ZoomIn.springify()
    .mass(1.5)
    .stiffness(300)
    .damping(15)
    .restDisplacementThreshold(0.01)}
  style={{ flex: 1 }}
>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' }}>
        Personalize Your Own Goal
      </Text>
      </Animated.View>

      <Text style={{ color: 'black', fontSize: 16, fontWeight:'bold', textAlign: 'center'}}>kCal</Text>
      <TextInput
        value={calories.toString()}
        onChangeText={(val) => {
          const clean = val.replace(/[^0-9]/g, '');
          setCalories(clean === '' ? 0 : parseInt(clean));
        }}
        keyboardType="numeric"
        placeholder="Enter calories"
        placeholderTextColor="#aaa"
        style={{
          backgroundColor: '#6C7072',
          color: 'white',
          padding: 10,
          borderRadius: 10,
          textAlign: 'center',
          marginBottom: 20,
          fontSize: 16,
          fontWeight: 'bold',
        }}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
        <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
  <MacroPicker
  label="Protein"
  value={macros.protein}
  onChange={(v) => updateMacro('protein', v)}
  calories={calories}
/>


</View>
        <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
  <MacroPicker
  label="Carbs"
  value={macros.carbs}
  onChange={(v) => updateMacro('carbs', v)}
  calories={calories}
/>


</View>

<View style={{ alignItems: 'center', marginHorizontal: 10 }}>
  <MacroPicker
  label="Fat"
  value={macros.fat}
  onChange={(v) => updateMacro('fat', v)}
  calories={calories}
/>

</View>
      </View>

      <Text
        style={{
          color: totalPercent === 100 ? 'lime' : 'red',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        Total: {totalPercent}% {totalPercent !== 100 && ' (must be 100%)'}
      </Text>

      <CustomButton
  title="Save"
  handlePress={() => {
    if (!isValid) {
      Alert.alert('Invalid Input', 'Calories must be greater than 0 and macros must total 100%.');
      return;
    }

    onSave({ calories, ...macros });
  }}
  disabled={!isValid}
  containerStyles="bg-white w-full mb-3"
/>


    </View>
  );
};

export default CustomMacroGoalForm;
