import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';

const CreateFoodModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleSave = () => {
    if (!name || !calories || !protein || !carbs || !fat) {
      Alert.alert('Every field is mandatory.');
      return;
    }

    const newFood = {
      name,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
    };

    onSave(newFood);
    onClose();
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      useNativeDriver
      backdropTransitionOutTiming={0}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create food</Text>

        <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="kCal / 100g" value={calories} onChangeText={setCalories} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Protein" value={protein} onChangeText={setProtein} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Carbs" value={carbs} onChangeText={setCarbs} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Fat" value={fat} onChangeText={setFat} keyboardType="numeric" style={styles.input} />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#C0C0C0',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
});

export default CreateFoodModal;
