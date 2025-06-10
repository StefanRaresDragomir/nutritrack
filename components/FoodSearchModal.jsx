import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button
} from 'react-native';
import Modal from 'react-native-modal';
import { searchFoods } from '../lib/appwrite';
import { Image } from 'react-native';





const FoodSearchModal = ({ visible, onClose, onCreateFood, onSelectFood, recentFoods }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);



  const handleSearch = async (text) => {
    setSearch(text);
    if (text.trim().length === 0) {
      setResults([]);
      return;
    }

    const found = await searchFoods(text);
    setResults(found);
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver
      backdropTransitionOutTiming={0}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <TextInput
    placeholder="Search food..."
    value={search}
    onChangeText={handleSearch}
    style={[styles.input, { flex: 1 }]}
  />
  <TouchableOpacity
  onPress={() => setShowBarcodeInput(!showBarcodeInput)}
  style={{ marginLeft: 8, marginTop: -12 }}
>
  <Image
    source={require('../assets/icons/barcode.png')}
    style={{ width: 28, height: 28 }}
    resizeMode="contain"
  />
</TouchableOpacity>


</View>

{showBarcodeInput && (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
    <TextInput
      placeholder="Enter barcode..."
      value={barcode}
      onChangeText={setBarcode}
      keyboardType="numeric"
      style={[styles.input, { flex: 1 }]}
    />
    <TouchableOpacity
      onPress={async () => {
        if (!barcode) return;
        try {
          const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
          const data = await res.json();
          if (data?.status === 1) {
            const p = data.product;
            const food = {
              name: p.product_name || 'Unnamed product',
              calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
              protein: Math.round(p.nutriments?.['proteins_100g'] || 0),
              carbs: Math.round(p.nutriments?.['carbohydrates_100g'] || 0),
              fat: Math.round(p.nutriments?.['fat_100g'] || 0),
              barcode: barcode
            };
            onSelectFood(food);
          } else {
            alert('Product not found. Try another barcode.');
          }
        } catch (e) {
          alert('Error while fetching product.');
          console.error(e);
        }
      }}
      style={{
        backgroundColor: '#C0C0C0',
        padding: 10,
        borderRadius: 8,
        marginLeft: 8
      }}
    >
      <Text style={{ color: 'white', fontWeight: '600' }}>Search</Text>
    </TouchableOpacity>
  </View>
)}


        <TouchableOpacity onPress={onCreateFood} style={styles.createButton}>
          <Text style={styles.createButtonText}>Create new food</Text>
        </TouchableOpacity>

        <FlatList
          data={search ? results : recentFoods}
          keyExtractor={(item, index) => item.$id || `${item.name}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelectFood(item)} style={styles.item}>
              <Text style={{ fontWeight: '500' }}>{item.name}</Text>
              <Text style={{ color: '#6b7280' }}>{item.calories} kcal / 100g</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    height: '55%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: '#C0C0C0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  createButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    backgroundColor: '#C0C0C0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FoodSearchModal;
