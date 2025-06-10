import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';

const EditFoodModal = ({ visible, onClose, food, onSave }) => {
  const [grams, setGrams] = useState('100');

  useEffect(() => {
    if (food) {
      setGrams(food.quantity?.toString() || '100');
    }
  }, [food]);

  if (!food) return null;

  const parsedGrams = parseFloat(grams) || 0;

  const perGram = {
    calories: (food.calories || 0) / (food.quantity || 1),
    protein: (food.protein || 0) / (food.quantity || 1),
    carbs: (food.carbs || 0) / (food.quantity || 1),
    fat: (food.fat || 0) / (food.quantity || 1),
  };

  const scale = (value) => (value * parsedGrams).toFixed(1);
  const scaleKcal = (value) => Math.round(value * parsedGrams);

  const handleSave = () => {
    const updatedFood = {
      ...food,
      quantity: parsedGrams,
      calories: scaleKcal(perGram.calories),
      protein: parseFloat(scale(perGram.protein)),
      carbs: parseFloat(scale(perGram.carbs)),
      fat: parseFloat(scale(perGram.fat)),
    };

    onSave(updatedFood);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <Text style={styles.title}>Edit Quantity</Text>
              <TextInput
                value={grams}
                onChangeText={setGrams}
                keyboardType="numeric"
                placeholder="Grams"
                style={styles.input}
              />
              <Text style={styles.preview}>
                {scaleKcal(perGram.calories)} kcal · P: {scale(perGram.protein)}g · C: {scale(perGram.carbs)}g · F: {scale(perGram.fat)}g
              </Text>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    textAlign: 'center',
    marginBottom: 12,
  },
  preview: {
    marginBottom: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#C0C0C0',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
});

export default EditFoodModal;
