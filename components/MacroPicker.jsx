import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';

const { height: windowHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2);

const MacroPicker = ({ label, value, onChange, calories }) => {
  const flatListRef = useRef(null);
  const data = Array.from({ length: 99 }, (_, i) => i + 1);

  useEffect(() => {
    const index = data.findIndex((v) => v === value);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: false });
    }
  }, [value]);

  const handleScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const selectedValue = data[index];
    onChange(selectedValue);
  };

  const getGrams = () => {
    if (label.toLowerCase() === 'protein' || label.toLowerCase() === 'carbs') {
      return Math.round((value / 100) * calories / 4);
    } else if (label.toLowerCase() === 'fat') {
      return Math.round((value / 100) * calories / 9);
    }
    return 0;
  };

  return (
    <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
      <Text style={{ color: 'black', marginBottom: 5 }}>{label}</Text>

      <View
        style={{
          height: ITEM_HEIGHT * VISIBLE_ITEMS,
          width: 70,
          overflow: 'hidden',
          borderRadius: 12,
          backgroundColor: '#6C7072',
        }}
      >
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                height: ITEM_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: item === value ? 24 : 16,
                  color: item === value ? '#4caf50' : 'white',
                  fontWeight: item === value ? 'bold' : 'normal',
                }}
              >
                {item}%
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * PADDING_ITEMS,
          }}
          onMomentumScrollEnd={handleScrollEnd}
          nestedScrollEnabled={true}
        />
      </View>

      <Text style={{ color: 'white', marginTop: 6 }}>{getGrams()}g</Text>
    </View>
  );
};

export default MacroPicker;
