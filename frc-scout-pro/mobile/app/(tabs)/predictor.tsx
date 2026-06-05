import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { analyticsAPI } from '../../api/client';

export default function Predictor() {
  const [eventKey, setEventKey] = useState('');
  const [matchNum, setMatchNum] = useState('');
  const [red, setRed] = useState(['', '', '']);
  const [blue, setBlue] = useState(['', '', '']);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const setRedTeam = (idx: number, val: string) => {
    const updated = [...red];
    updated[idx] = val;
    setRed(updated);
  };

  const setBlueTeam = (idx: number, val: string) => {
    const updated = [...blue];
    updated[idx] = val;
    setBlue(updated);
  };

  const predict = async () => {
    const redNums = red.filter(Boolean);
    const blueNums = blue.filter(Boolean);
    if (!eventKey || redNums.length === 0 || blueNums.length === 0) {
      Alert.alert('Error', 'Fill in event key and at least one team per alliance');
      return;
    }
    setLoading(true);
    try {
      const res = await analyticsAPI.predict({
        event_key: eventKey,
        red_alliance: redNums.join(','),
        blue_alliance: blueNums.join(','),
        match_number: matchNum || undefined,
      });
      setPrediction(res.data);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-xl font-bold text-white mt-12 mb-4">Match Predictor</Text>

      {/* Event + Match */}
      <View className="bg-slate-800 rounded-xl p-4 mb-4">
        <View className="mb-3">
          <Text className="text-slate-400 text-sm mb-1">Event Key</Text>
          <TextInput
            value={eventKey}
            onChangeText={setEventKey}
            placeholder="e.g. 2026oncmp"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            className="bg-slate-700 text-white rounded-xl px-4 py-3"
          />
        </View>
        <View>
          <Text className="text-slate-400 text-sm mb-1">Match Number (optional)</Text>
          <TextInput
            value={matchNum}
            onChangeText={setMatchNum}
            keyboardType="numeric"
            placeholder="e.g. 12"
            placeholderTextColor="#64748b"
            className="bg-slate-700 text-white rounded-xl px-4 py-3"
          />
        </View>
      </View>

      {/* Alliances */}
      <View className="flex-row gap-3 mb-4">
        {/* Red */}
        <View className="flex-1 bg-red-900/30 rounded-xl p-4">
          <Text className="text-red-400 font-semibold mb-3">Red Alliance</Text>
          {[0, 1, 2].map((i) => (
            <View key={i} className="mb-2">
              <Text className="text-slate-400 text-xs mb-1">Robot {i + 1}</Text>
              <TextInput
                value={red[i]}
                onChangeText={(v) => setRedTeam(i, v)}
                keyboardType="numeric"
                placeholder="Team #"
                placeholderTextColor="#64748b"
                className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
              />
            </View>
          ))}
        </View>

        {/* Blue */}
        <View className="flex-1 bg-blue-900/30 rounded-xl p-4">
          <Text className="text-blue-400 font-semibold mb-3">Blue Alliance</Text>
          {[0, 1, 2].map((i) => (
            <View key={i} className="mb-2">
              <Text className="text-slate-400 text-xs mb-1">Robot {i + 1}</Text>
              <TextInput
                value={blue[i]}
                onChangeText={(v) => setBlueTeam(i, v)}
                keyboardType="numeric"
                placeholder="Team #"
                placeholderTextColor="#64748b"
                className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
              />
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={predict}
        disabled={loading}
        className={`py-4 rounded-xl items-center mb-6 ${loading ? 'bg-purple-800' : 'bg-purple-600'}`}
      >
        {loading
          ? <ActivityIndicator color="white" />
          : <Text className="text-white font-bold text-base">Predict Match</Text>}
      </TouchableOpacity>

      {/* Prediction Result */}
      {prediction && (
        <View className="bg-slate-800 rounded-xl p-5">
          <Text className="text-slate-300 font-semibold text-center mb-4">Prediction Result</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-red-400 font-bold text-3xl">
                {prediction.red_score?.toFixed(0)}
              </Text>
              <Text className="text-red-300 text-sm mt-1">Red</Text>
            </View>
            <View className="items-center justify-center">
              <Text className="text-slate-400 text-2xl font-bold">vs</Text>
            </View>
            <View className="items-center">
              <Text className="text-blue-400 font-bold text-3xl">
                {prediction.blue_score?.toFixed(0)}
              </Text>
              <Text className="text-blue-300 text-sm mt-1">Blue</Text>
            </View>
          </View>
          {prediction.winner && (
            <View className="mt-4 items-center">
              <Text className="text-white text-base">
                Predicted winner:{' '}
                <Text className={prediction.winner === 'red' ? 'text-red-400 font-bold' : 'text-blue-400 font-bold'}>
                  {prediction.winner.toUpperCase()} Alliance
                </Text>
              </Text>
            </View>
          )}
          {prediction.confidence && (
            <Text className="text-slate-500 text-center text-sm mt-2">
              Confidence: {(prediction.confidence * 100).toFixed(0)}%
            </Text>
          )}
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
