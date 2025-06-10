import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '../context/GlobalProvider'; 
import { icons } from '../constants';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import {
  format,
  addDays,
  subDays,
  isToday,
  isYesterday,
  isTomorrow,
  isSameDay,
  getDaysInMonth,
  startOfMonth,
  addMonths,
} from 'date-fns';
import { ro } from 'date-fns/locale';

const getLabelForDate = (date) => {
  const today = new Date();
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isSameDay(date, subDays(today, 2))) return 'Alaltaieri';
  if (isSameDay(date, addDays(today, 2))) return 'Poimaine';
  return format(date, 'd MMMM yyyy', { locale: ro });
};

const getProgressColor = (difference) => {
  const absDiff = Math.min(Math.abs(difference), 500);

  const colorStops = [
    { value: 0, color: [74, 222, 128] },    // green
    { value: 100, color: [250, 204, 21] },  // yellow
    { value: 250, color: [249, 115, 22] },  // orange
    { value: 500, color: [239, 68, 68] }    // red
    
  ];

  
  let lower = colorStops[0];
  let upper = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (absDiff >= colorStops[i].value && absDiff <= colorStops[i + 1].value) {
      lower = colorStops[i];
      upper = colorStops[i + 1];
      break;
    }
  }

  const range = upper.value - lower.value;
  const ratio = range === 0 ? 0 : (absDiff - lower.value) / range;

  const r = Math.round(lower.color[0] + ratio * (upper.color[0] - lower.color[0]));
  const g = Math.round(lower.color[1] + ratio * (upper.color[1] - lower.color[1]));
  const b = Math.round(lower.color[2] + ratio * (upper.color[2] - lower.color[2]));

  return `rgb(${r}, ${g}, ${b})`;
};


const generateMonthDays = (date) => {
  const start = startOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  return Array.from({ length: daysInMonth }, (_, i) => addDays(start, i));
};

const CalendarWithDays = ({
  selectedDate,
  onDateChange,
  getDailyKcalDiff,
  headerColor = '#C0C0C0',
   goal = 2000
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const { currentMonth, setCurrentMonth } = useGlobalContext();
  const scrollRef = useRef(null);

  useEffect(() => {
    const monthDays = generateMonthDays(currentMonth);
    setWeekDates(monthDays);

    const index = monthDays.findIndex((d) => isSameDay(d, currentDate));
    if (index !== -1) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: index * 68 - 150,
          animated: true,
        });
      }, 100);
    }
  }, [currentMonth, currentDate]);

  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
      setCurrentMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate]);

  const handleDayPress = (date) => {
    setCurrentDate(date);
    onDateChange && onDateChange(date);
  };

  return (
    <View>
      
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 14,
          marginTop: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}>
            <Text style={{ fontSize: 18, marginRight: 10 }}>{'←'}</Text>
          </Pressable>
          <Text style={{ fontWeight: 'bold' }}>
            {format(currentMonth, 'MMMM yyyy', { locale: ro })}
          </Text>
          <Pressable onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <Text style={{ fontSize: 18, marginLeft: 10 }}>{'→'}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => setShowMonthModal(true)}>
          <Image
            source={icons.calendar}
            style={{ width: 24, height: 24, tintColor: 'black' }}
            resizeMode="contain"
          />
        </Pressable>
      </View>

     
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 6 }}
      >
        {weekDates.map((date) => {
          const kcalDiff = getDailyKcalDiff?.(date) ?? 0;
          const progressColor = goal && kcalDiff > goal
  ? 'rgb(239, 68, 68)'
  : getProgressColor(kcalDiff);

          const isSelected = isSameDay(date, currentDate);
          const progress = kcalDiff >= 0 ? 1 : (goal + kcalDiff) / goal; 
          const safeProgress = Math.max(0, Math.min(progress, 1)); 



          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => handleDayPress(date)}
              style={{
                alignItems: 'center',
                marginHorizontal: 10,
              }}
            >
              <View style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
  <Svg width={48} height={48}>
<SvgCircle
  cx={24}
  cy={24}
  r={20}
  stroke="#e5e7eb"
  strokeWidth={4}
  fill={isSelected ? '#ddd' : '#fff'}
  transform="rotate(-90 24 24)"
/>
{Math.abs(kcalDiff) > 0 && (
  <SvgCircle
    cx={24}
    cy={24}
    r={20}
    stroke={progressColor}
    strokeWidth={4}
    strokeLinecap="round"
    strokeDasharray={2 * Math.PI * 20}
    strokeDashoffset={2 * Math.PI * 20 * (1 - safeProgress)}
    fill="transparent"
    transform="rotate(-90 24 24)"
  />
)}


  </Svg>
  <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{format(date, 'd')}</Text>
  </View>
</View>

              <Text style={{ fontSize: 12, marginTop: 4 }}>
                {format(date, 'EEE', { locale: ro })}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

     
      <Modal
        visible={showMonthModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowMonthModal(false)}
      >
        <Pressable
          onPress={() => setShowMonthModal(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: 95,
          }}
        >
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={{
              width: '95%',
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              elevation: 5,
            }}
            onStartShouldSetResponder={() => true}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Pressable onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                <Text style={{ fontSize: 18 }}>{'←'}</Text>
              </Pressable>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                {format(currentMonth, 'MMMM yyyy', { locale: ro })}
              </Text>
              <Pressable onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <Text style={{ fontSize: 18 }}>{'→'}</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              {['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'].map((d) => (
                <Text key={d} style={{ width: 32, textAlign: 'center', fontWeight: 'bold' }}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 10 }}>
              {Array.from({ length: startOfMonth(currentMonth).getDay() || 7 }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: 32, height: 32, margin: 5 }} />
              ))}
              {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                const kcalDiff = getDailyKcalDiff?.(dayDate) ?? 0;
                const color = goal && kcalDiff > goal
  ? 'rgb(239, 68, 68)'
  : getProgressColor(kcalDiff);
                const progress = kcalDiff >= 0 ? 1 : (goal + kcalDiff) / goal;
                const safeProgress = Math.max(0, Math.min(progress, 1));


                return (
                 <Pressable
  key={i}
  onPress={() => {
    setCurrentDate(dayDate);
    setShowMonthModal(false);
    onDateChange && onDateChange(dayDate);
  }}
  style={{ margin: 5 }}
>
  <Svg width={32} height={32}>
    <SvgCircle
      cx={16}
      cy={16}
      r={13}
      stroke="#e5e7eb"
      strokeWidth={3}
      fill={isSameDay(currentDate, dayDate) ? '#ddd' : 'white'}
    />
    {Math.abs(kcalDiff) > 0 && (
  <SvgCircle
    cx={16}
    cy={16}
    r={13}
    stroke={color}
    strokeWidth={3}
    strokeLinecap="round"
    strokeDasharray={2 * Math.PI * 13}
    strokeDashoffset={2 * Math.PI * 13 * (1 - safeProgress)}
    fill="transparent"
    transform="rotate(-90 16 16)"
  />
)}

  </Svg>
  <View style={{
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{i + 1}</Text>
  </View>
</Pressable>

                );
              })}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CalendarWithDays;
