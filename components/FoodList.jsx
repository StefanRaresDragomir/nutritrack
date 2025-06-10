import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const renderRightActions = () => (
  <View
    style={{
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      borderRadius: 8,
      flex: 1,
      height: '80%',
    }}
  >
    <Text style={{ color: 'white', fontWeight: 'bold' }}>Del</Text>
  </View>
);

const FoodList = ({ foods = [], onDelete, onEdit }) => {

  return (
    <View
      style={{
        margin: 20,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 20 }}>
        Foods
      </Text>

      {(!foods || foods.length === 0) ? (
        <Text style={{ color: '#6b7280' }}>No food for today.</Text>
      ) : (
        <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 300 }}>
          {foods.map((item, index) => (
            <Swipeable
              key={`${item.name}-${index}`}
              friction={2}
              rightThreshold={40}
              overshootRight={false}
              onSwipeableOpen={() => onDelete(index)}
              renderRightActions={renderRightActions}
            >
              <TouchableOpacity
                onPress={() => onEdit(index)}

                style={{
                  marginBottom: 16,
                  backgroundColor: '#f9fafb',
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.name}</Text>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>
                  {item.quantity}g · {Math.round(item.calories)} kcal
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 14 }}>
                  Protein: {item.protein.toFixed(1)}g · Carbs: {item.carbs.toFixed(1)}g · Fat: {item.fat.toFixed(1)}g
                </Text>
              </TouchableOpacity>
            </Swipeable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default FoodList;
