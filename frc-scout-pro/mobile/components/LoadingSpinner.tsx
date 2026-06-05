import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function LoadingSpinner() {
  return (
    <View className="flex-1 justify-center items-center bg-slate-900">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}
