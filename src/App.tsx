import 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button } from './components/Button';
import { showToast } from './components/Toast';
import { ensureForegroundPermission } from './lib/location';
import { runSelfTests } from './lib/selfTests';
import { BusinessesScreen } from './screens/BusinessesScreen';
import { EventsScreen } from './screens/EventsScreen';
import { FriendsScreen } from './screens/FriendsScreen';
import { MapScreen } from './screens/MapScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { colors, radius, spacing, typography } from './theme/tokens';

type RootTabParamList = {
  Friends: undefined;
  Businesses: undefined;
  Events: undefined;
  Map: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabIcons = {
  Friends: { inactive: 'people-outline', active: 'people' },
  Businesses: { inactive: 'business-outline', active: 'business' },
  Events: { inactive: 'calendar-outline', active: 'calendar' },
  Map: { inactive: 'map-outline', active: 'map' },
  Profile: { inactive: 'person-outline', active: 'person' },
} as const;

if (__DEV__) {
  runSelfTests();
}

export default function App() {
  const [permissionPromptVisible, setPermissionPromptVisible] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary: colors.primary,
            background: colors.bg,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            notification: colors.accent,
          },
        }}
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.subtext,
            tabBarLabelStyle: styles.tabLabel,
            tabBarStyle: styles.tabBar,
            tabBarItemStyle: styles.tabItem,
            tabBarIcon: ({ color, focused, size }) => {
              const icon = focused ? tabIcons[route.name].active : tabIcons[route.name].inactive;
              return <Ionicons name={icon} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Friends" component={FriendsScreen} />
          <Tab.Screen name="Businesses" component={BusinessesScreen} />
          <Tab.Screen name="Events" component={EventsScreen} />
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <LocationPermissionPrompt visible={permissionPromptVisible} onClose={() => setPermissionPromptVisible(false)} />
    </SafeAreaProvider>
  );
}

function LocationPermissionPrompt({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await ensureForegroundPermission();
      showToast(result.granted ? 'Location access enabled.' : 'Location access was not enabled.');
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not request location access.';
      showToast(message);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.promptBackdrop} onPress={onClose} />
      <View style={styles.promptWrap}>
        <View style={styles.promptCard}>
          <View style={styles.promptIcon}>
            <Ionicons name="navigate" size={26} color={colors.card} />
          </View>
          <Text style={styles.promptTitle}>Allow location access?</Text>
          <Text style={styles.promptBody}>
            Notifier uses your location to show nearby places and events, share your live location with chosen circles
            only when you choose, and send optional geofenced reminders.
          </Text>
          <View style={styles.promptButtons}>
            <Button style={styles.promptButton} loading={isRequesting} onPress={requestPermission}>
              Allow
            </Button>
            <Button style={styles.promptButton} variant="secondary" onPress={onClose}>
              Not now
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    minHeight: 78,
    paddingTop: spacing(2),
    paddingBottom: spacing(3),
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  tabItem: {
    paddingVertical: spacing(1),
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  promptBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.34)',
  },
  promptWrap: {
    position: 'absolute',
    left: spacing(4),
    right: spacing(4),
    bottom: spacing(7),
  },
  promptCard: {
    gap: spacing(3),
    padding: spacing(5),
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptTitle: {
    ...typography.section,
    fontSize: 22,
    lineHeight: 28,
  },
  promptBody: {
    ...typography.body,
    color: colors.subtext,
  },
  promptButtons: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  promptButton: {
    flex: 1,
  },
});
