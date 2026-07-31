import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const defaultScreenOptions = {
  headerStyle: { backgroundColor: Colors.background, elevation: 0, shadowOpacity: 0 },
  headerTintColor: Colors.text,
  headerTitleStyle: { fontWeight: 'bold' as const, fontSize: 18 },
  cardStyle: { backgroundColor: Colors.background },
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar Conta' }} />
  </Stack.Navigator>
);

const MatchesStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen name="MatchesList" component={MatchesScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={defaultScreenOptions}>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Seu Perfil' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar Perfil' }} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any;

        if (route.name === 'Home') {
          iconName = focused ? 'flame' : 'flame-outline';
        } else if (route.name === 'MatchesStack') {
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        } else if (route.name === 'ProfileStack') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Radar Geek' }} />
    <Tab.Screen name="MatchesStack" component={MatchesStack} options={{ title: 'Matches' }} />
    <Tab.Screen name="ProfileStack" component={ProfileStack} options={{ title: 'Perfil' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
