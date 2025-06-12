import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';

const AddFoodToDayModal = ({ visible, onClose, food, onAdd }) => {
  const [grams, setGrams] = useState('');

  if (!food) return null;

  const parsedGrams = parseFloat(grams);
  const isValid = !isNaN(parsedGrams) && parsedGrams > 0;

  const scale = (value) => ((value / 100) * parsedGrams).toFixed(1);

  const handleAdd = () => {
    if (!isValid) {
      Alert.alert('Please enter a valid amount.');
      return;
    }

    const foodEntry = {
      name: food.name,
      quantity: parsedGrams,
      calories: Number(scale(food.calories)),
      protein: Number(scale(food.protein)),
      carbs: Number(scale(food.carbs)),
      fat: Number(scale(food.fat)),
    };

    onAdd(foodEntry);
    setGrams('');
    onClose();
  };

  return (
    
    <Modal
  isVisible={visible}
  onBackdropPress={onClose}
  swipeDirection="down" 
  onSwipeComplete={onClose}
  animationIn="slideInUp"
  animationOut="slideOutDown"
  useNativeDriver
  avoidKeyboard 
  style={{ justifyContent: 'flex-end', margin: 0 }} 
>


      <View style={styles.container}>
        <Text style={styles.title}>{food.name}</Text>

        <TextInput
          placeholder="g (ex: 100)"
          placeholderTextColor="#C0C0C0"
          value={grams}
          onChangeText={setGrams}
          keyboardType="numeric"
          style={styles.input}
        />

        {isValid && (
          <View style={styles.preview}>
            <Text>{scale(food.calories)} kcal</Text>
            <Text>Protein: {scale(food.protein)}g</Text>
            <Text>Carbs: {scale(food.carbs)}g</Text>
            <Text>Fat: {scale(food.fat)}g</Text>
          </View>
        )}

        <TouchableOpacity onPress={handleAdd} style={styles.button}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Add today</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
  backgroundColor: 'white',
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
},
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  preview: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#C0C0C0',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default AddFoodToDayModal;
