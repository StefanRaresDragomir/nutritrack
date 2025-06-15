import React, { useState, useEffect, useRef, useCallback } from 'react';
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



 const searchTimeout = useRef(null);

const handleSearch = useCallback((text) => {
  setSearch(text);

  if (searchTimeout.current) clearTimeout(searchTimeout.current);

  searchTimeout.current = setTimeout(() => {
    performSearch(text);
  }, 300); 
}, []);


const performSearch = async (text) => {
  if (!text.trim()) {
    setResults([]);
    return;
  }

  try {
    const localResults = await searchFoods(text);
    const normalizedLocal = localResults.map((f) => ({
      name: f.name || 'Unnamed product',
      calories: Number(f.calories) || 0,
      protein: Number(f.protein) || 0,
      carbs: Number(f.carbs) || 0,
      fat: Number(f.fat) || 0,
      barcode: f.barcode || null,
      isExternal: false,
    }));

    if (normalizedLocal.length > 0) {
      setResults(normalizedLocal);
      return;
    }

    const offRes = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(text)}&search_simple=1&action=process&json=1`,
      {
        headers: {
          'User-Agent': 'NutriTrackApp/1.0 (React Native)',
        },
      }
    );
    const data = await offRes.json();
    const external = (data.products || []).map((p) => ({
      name: p.product_name || 'Unnamed product',
      calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
      protein: Math.round(p.nutriments?.['proteins_100g'] || 0),
      carbs: Math.round(p.nutriments?.['carbohydrates_100g'] || 0),
      fat: Math.round(p.nutriments?.['fat_100g'] || 0),
      barcode: p.code,
      isExternal: true,
      source: 'OpenFoodFacts',
    }));

    setResults(external.slice(0, 5));
  } catch (e) {
    console.error('Search error:', e);
    setResults([]);
  }
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
  <View style={{ position: 'relative', flex: 1 }}>
  <TextInput
    value={search}
    onChangeText={handleSearch}
    style={[styles.input, { paddingLeft: 40 }]} 
  />
  {search.length === 0 && (
    <Image
      source={require('../assets/icons/search.png')} 
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        width: 20,
        height: 20,
        tintColor: '#C0C0C0',
      }}
    />
  )}
</View>

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
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'NutriTrackApp/1.0 (React Native)', 
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();

    if (data?.status === 1) {
      const p = data.product;
      const food = {
        name: p.product_name || 'Unnamed product',
        calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
        protein: Math.round(p.nutriments?.['proteins_100g'] || 0),
        carbs: Math.round(p.nutriments?.['carbohydrates_100g'] || 0),
        fat: Math.round(p.nutriments?.['fat_100g'] || 0),
        barcode: p.code,
        isExternal: true,
      };

      onSelectFood(food);
    } else {
      alert('Product not found in OpenFoodFacts. Try another barcode.');
    }
  } catch (e) {
    alert('Error while fetching product from OpenFoodFacts.');
    console.error('Fetch error (barcode):', e);
  }
}}


      style={{
        backgroundColor: '#C0C0C0',
        padding: 10,
        borderRadius: 8,
        marginLeft: 8,
        marginTop:-12
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
          data={results.length > 0 ? results : recentFoods}
          keyExtractor={(item, index) => item.$id || `${item.name}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelectFood(item)} style={styles.item}>
              <Text style={{ fontWeight: '500' }}>{item.name}</Text>
              <Text style={{ color: '#6b7280' }}>
                {(item.calories ?? 0)} kcal / 100g
                {item.isExternal && ` (${item.source || 'External'})`}

              </Text>


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
