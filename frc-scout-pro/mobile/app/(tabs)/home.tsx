import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { tbaAPI } from '../../api/client';

export default function Home() {
  const { user, logout } = useAuth();
  const [teamSearch, setTeamSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState('');

  const searchTeam = async () => {
    const num = teamSearch.trim();
    if (!num) return;
    setTeamLoading(true);
    setTeamError('');
    try {
      await tbaAPI.getTeam(num);
      router.push(`/team/${num}`);
    } catch {
      setTeamError(`Team ${num} not found`);
    } finally {
      setTeamLoading(false);
    }
  };

  const quickLinks = [
    { label: 'Events', icon: 'calendar' as const, href: '/(tabs)/events' },
    { label: 'Scout', icon: 'clipboard' as const, href: '/(tabs)/scout' },
    { label: 'Dashboard', icon: 'bar-chart' as const, href: '/(tabs)/dashboard' },
    { label: 'Pick List', icon: 'list' as const, href: '/(tabs)/picklist' },
    { label: 'Predictor', icon: 'flash' as const, href: '/(tabs)/predictor' },
    { label: 'Assignments', icon: 'people' as const, href: '/assignments' },
    { label: 'Team Mgmt', icon: 'settings' as const, href: '/team-management' },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mt-12 mb-6">
        <View>
          <Text className="text-2xl font-bold text-white">FRC Scout Pro</Text>
          <Text className="text-slate-400 text-sm">
            Welcome, {user?.username} · {user?.role}
          </Text>
        </View>
        <TouchableOpacity onPress={logout} className="bg-slate-700 rounded-lg p-2">
          <Ionicons name="log-out-outline" size={22} color="#f87171" />
        </TouchableOpacity>
      </View>

      {/* Team Search */}
      <View className="bg-slate-800 rounded-xl p-4 mb-4">
        <Text className="text-slate-300 font-semibold mb-3">Search Team</Text>
        <View className="flex-row gap-2">
          <TextInput
            value={teamSearch}
            onChangeText={setTeamSearch}
            placeholder="Team number (e.g. 254)"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            className="flex-1 bg-slate-700 text-white rounded-xl px-4 py-3"
            onSubmitEditing={searchTeam}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={searchTeam}
            className="bg-blue-600 rounded-xl px-4 justify-center"
          >
            {teamLoading
              ? <ActivityIndicator color="white" size="small" />
              : <Ionicons name="search" size={20} color="white" />}
          </TouchableOpacity>
        </View>
        {teamError ? <Text className="text-red-400 text-sm mt-2">{teamError}</Text> : null}
      </View>

      {/* Event Search */}
      <View className="bg-slate-800 rounded-xl p-4 mb-6">
        <Text className="text-slate-300 font-semibold mb-3">Search Event</Text>
        <View className="flex-row gap-2">
          <TextInput
            value={eventSearch}
            onChangeText={setEventSearch}
            placeholder="Event key (e.g. 2026oncmp)"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            className="flex-1 bg-slate-700 text-white rounded-xl px-4 py-3"
            onSubmitEditing={() => {
              if (eventSearch.trim()) router.push(`/event/${eventSearch.trim()}`);
            }}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={() => { if (eventSearch.trim()) router.push(`/event/${eventSearch.trim()}`); }}
            className="bg-blue-600 rounded-xl px-4 justify-center"
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Links */}
      <Text className="text-slate-300 font-semibold mb-3">Quick Access</Text>
      <View className="flex-row flex-wrap gap-3">
        {quickLinks.map((link) => (
          <TouchableOpacity
            key={link.href}
            onPress={() => router.push(link.href as any)}
            className="bg-slate-800 rounded-xl p-4 items-center"
            style={{ width: '30%' }}
          >
            <Ionicons name={link.icon} size={24} color="#3b82f6" />
            <Text className="text-slate-300 text-xs mt-2 text-center">{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Team Info */}
      {user?.team_id && (
        <View className="bg-slate-800 rounded-xl p-4 mt-6">
          <Text className="text-slate-300 font-semibold mb-1">Your Team</Text>
          {user.frc_number && (
            <Text className="text-blue-400 text-lg font-bold">FRC #{user.frc_number}</Text>
          )}
          {user.team_code && (
            <Text className="text-slate-400 text-sm mt-1">
              Join code: <Text className="text-yellow-400 font-mono">{user.team_code}</Text>
            </Text>
          )}
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
