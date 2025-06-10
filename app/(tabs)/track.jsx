import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import CalendarWithDays from '../../components/CalendarWithDays';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import DailyCalorieProgress from '../../components/DailyCalorieProgress';
import { databases, config } from '../../lib/appwrite';
import { Query } from 'react-native-appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';
import { ScrollView } from 'react-native';
import FoodList from '../../components/FoodList';
import FAB from '../../components/FAB';
import FoodSearchModal from '../../components/FoodSearchModal';
import CreateFoodModal from '../../components/CreateFoodModal';
import AddFoodToDayModal from '../../components/AddFoodToDayModal';
import EditFoodModal from '../../components/EditFoodModal';
import { createFood } from '../../lib/appwrite'; 
import { ID } from 'react-native-appwrite';
import {
  isToday,
  isYesterday,
  isTomorrow,
  isSameDay,
  subDays,
  addDays,
  format
} from 'date-fns';
import { ro } from 'date-fns/locale';







const Track = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [dailyLog, setDailyLog] = useState(null);
  const { user, userGoal, setUserGoal, refreshGoals } = useGlobalContext();




const [showFoodModal, setShowFoodModal] = useState(false);
const [showCreateModal, setShowCreateModal] = useState(false);

const [allGoals, setAllGoals] = useState([]);




const [editModalVisible, setEditModalVisible] = useState(false);
const [selectedFoodIndex, setSelectedFoodIndex] = useState(null);
const [selectedFood, setSelectedFood] = useState(null);
const [showGramModal, setShowGramModal] = useState(false);

const [monthlyLogs, setMonthlyLogs] = useState({});


const handleSelectFood = (food) => {
  setSelectedFood(food);
  setShowFoodModal(false);
  setTimeout(() => setShowGramModal(true), 400);
};

const handleEditFood = (index) => {
  const foodList = typeof dailyLog?.foods === 'string'
    ? JSON.parse(dailyLog.foods)
    : dailyLog?.foods || [];

  const food = foodList[index];
  if (!food) return;

  setSelectedFood(food);

  
  setTimeout(() => {
    setSelectedFoodIndex(index);
    setEditModalVisible(true);
  }, 100);
};

const getLabelForDate = (date) => {
  const today = new Date();
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isSameDay(date, subDays(today, 2))) return 'Alaltaieri';
  if (isSameDay(date, addDays(today, 2))) return 'Poimaine';
  return format(date, 'd MMMM yyyy', { locale: ro });
};

useEffect(() => {
  if (!user) return;

  const fetchAllGoals = async () => {
    try {
      const res = await databases.listDocuments(
        config.databaseId,
        config.goalsCollectionId,
        [Query.equal('userId', user.$id)]
      );

      const sorted = res.documents.sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
      );

      setAllGoals(sorted);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  };

  fetchAllGoals();
}, [user, refreshGoals]);

const getGoalForDate = (date) => {
  const dateOnly = new Date(date);
  dateOnly.setHours(23, 59, 59, 999); 

  const matching = [...allGoals]
    .filter((g) => new Date(g.startDate) <= dateOnly)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  return matching[0] || null;
};


const todayGoal = getGoalForDate(selectedDate);
const proteinGoal = todayGoal?.protein || 0;
const carbsGoal = todayGoal?.carbs || 0;
const fatGoal = todayGoal?.fat || 0;



const saveEditedFood = async (updatedFood) => {
  if (!dailyLog || selectedFoodIndex === null) return;

  const foods = JSON.parse(dailyLog.foods);
  foods[selectedFoodIndex] = updatedFood;

  const newTotals = foods.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const updatedLog = await databases.updateDocument(
    config.databaseId,
    config.dailyLogsCollectionId,
    dailyLog.$id,
    {
      foods: JSON.stringify(foods),
      totalCalories: newTotals.calories,
      totalProtein: newTotals.protein,
      totalCarbs: newTotals.carbs,
      totalFat: newTotals.fat,
    }
  );

  setDailyLog(updatedLog);
  const dateKey = selectedDate.toDateString();
  setMonthlyLogs((prev) => ({
    ...prev,
    [dateKey]: updatedLog,
  }));
};


const handleAddToDay = async (foodEntry) => {
  if (!user || !selectedDate) return;

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const entryKcal = foodEntry.calories;
  const entryProtein = foodEntry.protein;
  const entryCarbs = foodEntry.carbs;
  const entryFat = foodEntry.fat;

  try {
    const res = await databases.listDocuments(
      config.databaseId,
      config.dailyLogsCollectionId,
      [
        Query.equal('userId', user.$id),
        Query.greaterThanEqual('date', startOfDay.toISOString()),
        Query.lessThanEqual('date', endOfDay.toISOString())
      ]
    );

    const dateKey = selectedDate.toDateString();

if (res.total > 0) {
  const doc = res.documents[0];
  const existingFoods = doc.foods ? JSON.parse(doc.foods) : [];
  const updatedFoods = [...existingFoods, foodEntry];

  const updatedLog = await databases.updateDocument(
    config.databaseId,
    config.dailyLogsCollectionId,
    doc.$id,
    {
      foods: JSON.stringify(updatedFoods),
      totalCalories: doc.totalCalories + entryKcal,
      totalProtein: doc.totalProtein + entryProtein,
      totalCarbs: doc.totalCarbs + entryCarbs,
      totalFat: doc.totalFat + entryFat,
    }
  );

  setDailyLog(updatedLog);
  setMonthlyLogs((prev) => ({
    ...prev,
    [dateKey]: updatedLog,
  }));
} else {
  const newLog = await databases.createDocument(
    config.databaseId,
    config.dailyLogsCollectionId,
    ID.unique(),
    {
      userId: user.$id,
      date: selectedDate.toISOString(),
      foods: JSON.stringify([foodEntry]),
      totalCalories: entryKcal,
      totalProtein: entryProtein,
      totalCarbs: entryCarbs,
      totalFat: entryFat,
    }
  );

  setDailyLog(newLog);
  setMonthlyLogs((prev) => ({
    ...prev,
    [dateKey]: newLog,
  }));

 
    }
  } catch (err) {
    console.error('Eroare la salvare in dailyLogs:', err);
  }
};


const handleCreateFood = () => {
  setShowFoodModal(false);
  setTimeout(() => setShowCreateModal(true), 500);
};



  const [showAnimated, setShowAnimated] = useState(false);

useFocusEffect(
  useCallback(() => {
    setShowAnimated(false); 
    setTimeout(() => setShowAnimated(true), 10); 
  }, [])
);

const handleDeleteFood = async (index) => {
  if (!dailyLog) return;

  try {
    const foods = JSON.parse(dailyLog.foods);
    const removed = foods.splice(index, 1);

    const newTotals = foods.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const dateKey = selectedDate.toDateString();

if (foods.length === 0) {

  
  
  await databases.deleteDocument(
    config.databaseId,
    config.dailyLogsCollectionId,
    dailyLog.$id
  );
  setDailyLog(null);
  setMonthlyLogs((prev) => {
    const updated = { ...prev };
    delete updated[dateKey];
    return updated;
  });
} else {
  const updatedLog = await databases.updateDocument(
    config.databaseId,
    config.dailyLogsCollectionId,
    dailyLog.$id,
    {
      foods: JSON.stringify(foods),
      totalCalories: newTotals.calories,
      totalProtein: newTotals.protein,
      totalCarbs: newTotals.carbs,
      totalFat: newTotals.fat,
    }
  );
  setDailyLog(updatedLog);
  setMonthlyLogs((prev) => ({
    ...prev,
    [dateKey]: updatedLog,
  }));
}
  } catch (err) {
    console.error('Eroare la stergere aliment:', err);
  }
};

useEffect(() => {
  if (!user) return;

  const fetchGoal = async () => {
    try {
      const res = await databases.listDocuments(
        config.databaseId,
        config.goalsCollectionId,
        [Query.equal('userId', user.$id)]
      );

      if (res.total > 0) {
        setUserGoal(res.documents[0]);
      } else {
        setUserGoal(null);
      }
    } catch (err) {
      console.error('Failed to fetch user goal:', err);
    }
  };

  fetchGoal();
}, [user]);

useEffect(() => {
  if (!user || !selectedDate) return;

  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const fetchMonthLogs = async () => {
    try {
      const res = await databases.listDocuments(
        config.databaseId,
        config.dailyLogsCollectionId,
        [
          Query.equal('userId', user.$id),
          Query.greaterThanEqual('date', startOfMonth.toISOString()),
          Query.lessThanEqual('date', endOfMonth.toISOString())
        ]
      );

      const logsMap = {};
      res.documents.forEach(log => {
        const dateKey = new Date(log.date).toDateString();
        logsMap[dateKey] = log;
      });

      setMonthlyLogs((prev) => ({
  ...prev,
  ...logsMap, 
}));
    } catch (err) {
      console.error('Failed to fetch month logs:', err);
    }
  };

  fetchMonthLogs();
}, [user, selectedDate]);



useEffect(() => {
  if (!user || !selectedDate) return;

  const fetchDailyLog = async () => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const res = await databases.listDocuments(
        config.databaseId,
        config.dailyLogsCollectionId,
        [
          Query.equal('userId', user.$id),
          Query.greaterThanEqual('date', startOfDay.toISOString()),
          Query.lessThanEqual('date', endOfDay.toISOString())
        ]
      );

      if (res.total > 0) {
        setDailyLog(res.documents[0]);
      } else {
        setDailyLog(null);
      }
    } catch (err) {
      console.error('Failed to fetch daily log:', err);
    }
  };

  fetchDailyLog();
}, [selectedDate, user]);



  const getDailyKcalDiff = (date) => {
  const dateKey = date.toDateString();
  const log = monthlyLogs[dateKey];

  const goal = getGoalForDate(date);

  if (!log || !goal) return 0;

  return log.totalCalories - goal.calories;
};




  return (

    
    <View style={{ flex: 1 }}>
      <View style={{ backgroundColor: '#C0C0C0', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44 }}>
  <StatusBar barStyle="light-content" backgroundColor="#C0C0C0" />
  <View style={{ paddingVertical: 14, alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
      {getLabelForDate(selectedDate)}
    </Text>
  </View>
</View>
  {showAnimated ? (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(400)}
      style={{ flex: 1 }}
    >
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      <CalendarWithDays
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        getDailyKcalDiff={getDailyKcalDiff}
        headerColor="#C0C0C0"
         goal={userGoal?.calories || 2000}
      />

      <DailyCalorieProgress
  total={dailyLog?.totalCalories || 0}
  goal={todayGoal?.calories || 2000}
  protein={dailyLog?.totalProtein || 0}
  carbs={dailyLog?.totalCarbs || 0}
  fat={dailyLog?.totalFat || 0}
  proteinGoal={proteinGoal}
  carbsGoal={carbsGoal}
  fatGoal={fatGoal}
/>



<FoodList
  foods={dailyLog?.foods ? JSON.parse(dailyLog.foods) : []}
  onDelete={handleDeleteFood}
  onEdit={handleEditFood}
/>





<FoodSearchModal
  visible={showFoodModal}
  onClose={() => setShowFoodModal(false)}
  onCreateFood={handleCreateFood}
  onSelectFood={handleSelectFood}
  recentFoods={[]} // de completat ulterior
/>

<CreateFoodModal
  visible={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onSave={async (newFood) => {
  try {
    const saved = await createFood(newFood);
    console.log('Saved successfully: ', saved);
    // Optional: update lista de alimente recente
  } catch (err) {
    console.error('Saving error: ', err);
  }
}}

/>

<AddFoodToDayModal
  visible={showGramModal}
  onClose={() => setShowGramModal(false)}
  food={selectedFood}
  onAdd={handleAddToDay}
/>

<EditFoodModal
  visible={editModalVisible}
  onClose={() => setEditModalVisible(false)}
  food={selectedFood}
  onSave={saveEditedFood}
/>


</ScrollView>

<FAB onPress={() => setShowFoodModal(true)} />


    </Animated.View>
  ) : (
    <View style={{ flex: 1, opacity: 0 }} />
  )}
</View>

  );
};

export default Track;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
