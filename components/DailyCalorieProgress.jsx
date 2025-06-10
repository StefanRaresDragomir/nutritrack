import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

const getProgressColor = (difference) => {
  const absDiff = Math.min(Math.abs(difference), 500);

  const colorStops = [
    { value: 0, color: [74, 222, 128] },
    { value: 100, color: [250, 204, 21] },
    { value: 250, color: [249, 115, 22] },
    { value: 500, color: [239, 68, 68] },
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

const MacroBar = ({ label, value, goal, color = '#000' }) => {

  const barWidth = useSharedValue(0);

  

  useEffect(() => {
  const percentage = goal > 0 ? (value / goal) * 100 : 0;
  barWidth.value = withTiming(Math.min(percentage, 100), { duration: 600 });
}, [value, goal]);


  const animatedBarStyle = useAnimatedStyle(() => {
    return { width: `${barWidth.value}%` };
  });

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '500' }}>{label}</Text>
        <Text style={{ color: value > goal ? '#dc2626' : 'black' }}>
  {Math.round(value)} / {Math.round(goal)}g
</Text>

      </View>
      <View
        style={{
          height: 8,
          backgroundColor: '#e5e7eb',
          borderRadius: 8,
          marginTop: 4,
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: color,
              height: '100%',
              borderRadius: 8,
            },
            animatedBarStyle,
          ]}
        />
      </View>
    </View>
  );
};

const DailyCalorieProgress = ({
  total,
  goal,
  protein,
  carbs,
  fat,
  proteinGoal = 0,
  carbsGoal = 0,
  fatGoal = 0
}) => {


  const difference = total - goal;
  const color = getProgressColor(difference);

  const progress = goal > 0 ? Math.min(1, total / goal) : 0;
  const animatedProgress = useSharedValue(progress);


  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 800 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 2 * Math.PI * 60 * (1 - animatedProgress.value),
  }));

  const macros = [
  { label: 'Protein', value: protein, goal: proteinGoal, color: '#22c55e' },
  { label: 'Carbs', value: carbs, goal: carbsGoal, color: '#eab308' },
  { label: 'Fat', value: fat, goal: fatGoal, color: '#ef4444' },
];



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
        alignItems: 'center',
      }}
    >
      <View style={{ width: 160, height: 160, marginBottom: 12 }}>
        <Svg width={160} height={160}>
          <SvgCircle
            cx={80}
            cy={80}
            r={60}
            stroke="#e5e7eb"
            strokeWidth={10}
            fill="none"
          />
          <AnimatedCircle
            cx={80}
            cy={80}
            r={60}
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={2 * Math.PI * 60}
            animatedProps={animatedProps}
          />
        </Svg>
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
            {difference >= 0
            ? `+${Math.round(difference)} kcal`
            : `${Math.abs(Math.round(difference))} kcal`}
          </Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>
            {difference >= 0 ? 'over' : 'left'}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
        {Math.round(total)} / {Math.round(goal)} kcal
      </Text>
      <View style={{ width: '100%' }}>
        {macros.map((item) => (
          <MacroBar
            key={item.label}
            label={item.label}
            value={item.value}
            goal={item.goal}
            color={item.color}
          />

        ))}
      </View>
    </View>
  );
};

export default DailyCalorieProgress;
