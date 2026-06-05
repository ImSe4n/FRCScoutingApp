import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tbaAPI } from '../../api/client';

const EVENT_TYPES: Record<string, string> = {
  '': 'All Types',
  '0': 'Regional',
  '1': 'District',
  '2': 'District Champs',
  '3': 'Championship Division',
  '4': 'Championship Finals',
  '99': 'Offseason',
};

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    tbaAPI.getEvents()
      .then((r) => { setEvents(r.data); setFiltered(r.data); })
      .catch(() => setError('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = events;
    if (typeFilter !== '') list = list.filter((e) => String(e.event_type) === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        e.name?.toLowerCase().includes(q) || e.key?.toLowerCase().includes(q) || e.city?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, typeFilter, events]);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-slate-400 mt-3">Loading events…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="bg-slate-800 px-4 pt-14 pb-4">
        <Text className="text-xl font-bold text-white mb-4">2026 Events</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search events…"
          placeholderTextColor="#64748b"
          className="bg-slate-700 text-white rounded-xl px-4 py-3 mb-3"
        />
        {/* Type filter chips */}
        <FlatList
          horizontal
          data={Object.entries(EVENT_TYPES)}
          keyExtractor={([k]) => k}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: [key, label] }) => (
            <TouchableOpacity
              onPress={() => setTypeFilter(key)}
              className={`px-3 py-1 rounded-full mr-2 ${typeFilter === key ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <Text className={`text-sm ${typeFilter === key ? 'text-white' : 'text-slate-400'}`}>{label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {error ? (
        <View className="p-4"><Text className="text-red-400">{error}</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/event/${item.key}`)}
              className="bg-slate-800 rounded-xl p-4 mb-3"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-2">
                  <Text className="text-white font-semibold">{item.name}</Text>
                  <Text className="text-slate-400 text-sm mt-1">
                    {item.city}{item.state_prov ? `, ${item.state_prov}` : ''}
                    {item.country && item.country !== 'USA' ? `, ${item.country}` : ''}
                  </Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    {item.start_date} – {item.end_date}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-500 text-xs font-mono">{item.key}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" style={{ marginTop: 4 }} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-slate-500">No events found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
