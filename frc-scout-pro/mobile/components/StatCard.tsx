import React from 'react';
import { View, Text } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function StatCard({ label, value, sub, color = 'text-blue-400' }: StatCardProps) {
  return (
    <View className="bg-slate-800 rounded-xl p-4 flex-1 mx-1">
      <Text className="text-slate-400 text-xs mb-1">{label}</Text>
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
      {sub ? <Text className="text-slate-500 text-xs mt-1">{sub}</Text> : null}
    </View>
  );
}
