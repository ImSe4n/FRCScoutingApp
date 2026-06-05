import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function More() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const items = [
    {
      label: 'Assignments',
      icon: 'people-outline' as const,
      desc: 'Manage scouting assignments',
      href: '/assignments',
      adminOnly: true,
    },
    {
      label: 'Team Management',
      icon: 'settings-outline' as const,
      desc: 'Members, roles, and join code',
      href: '/team-management',
      adminOnly: false,
    },
  ];

  const visibleItems = items.filter((i) => !i.adminOnly || user?.role === 'admin');

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-xl font-bold text-white mt-12 mb-2">More</Text>

      {/* Profile card */}
      <View className="bg-slate-800 rounded-xl p-4 mb-6">
        <Text className="text-white font-semibold text-base">{user?.username}</Text>
        <Text className="text-slate-400 text-sm capitalize mt-1">{user?.role}</Text>
        {user?.frc_number && (
          <Text className="text-blue-400 text-sm mt-1">FRC #{user.frc_number}</Text>
        )}
        {user?.team_code && (
          <View className="mt-2 flex-row items-center">
            <Text className="text-slate-400 text-sm">Join code: </Text>
            <Text className="text-yellow-400 font-mono text-sm">{user.team_code}</Text>
          </View>
        )}
      </View>

      {visibleItems.map((item) => (
        <TouchableOpacity
          key={item.href}
          onPress={() => router.push(item.href as any)}
          className="bg-slate-800 rounded-xl p-4 mb-3 flex-row items-center"
        >
          <View className="w-10 h-10 bg-slate-700 rounded-lg items-center justify-center mr-4">
            <Ionicons name={item.icon} size={22} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">{item.label}</Text>
            <Text className="text-slate-500 text-sm mt-0.5">{item.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-900/30 rounded-xl p-4 mt-4 flex-row items-center"
      >
        <View className="w-10 h-10 bg-red-900/50 rounded-lg items-center justify-center mr-4">
          <Ionicons name="log-out-outline" size={22} color="#f87171" />
        </View>
        <Text className="text-red-400 font-medium">Sign Out</Text>
      </TouchableOpacity>

      <View className="h-8" />
    </ScrollView>
  );
}
