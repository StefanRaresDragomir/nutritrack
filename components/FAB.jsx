import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FAB = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.fab}>
      <View style={styles.button}>
        <Ionicons name="add" size={28} color="white" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 10,
  },
  button: {
    backgroundColor: '#C0C0C0',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default FAB;
