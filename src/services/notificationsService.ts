import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface RoutineReminder {
  id: string;
  name: string;
  deadline: Date;
}

async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Avisos gerais',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#5DBB8A',
  });
  await Notifications.setNotificationChannelAsync('routines', {
    name: 'Lembretes de rotina',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150],
    lightColor: '#FF8C42',
  });
}

export async function requestPermission(): Promise<boolean> {
  await ensureAndroidChannels();

  const { status: currentStatus } = await Notifications.getPermissionsAsync();
  if (currentStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return status === 'granted';
}

export async function getPushToken(): Promise<string | null> {
  try {
    const granted = await requestPermission();
    if (!granted) return null;

    if (!Constants.isDevice) return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn('[Notifications] EAS projectId not found. Push token not obtained.');
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    return token;
  } catch (error) {
    console.warn('[Notifications] Failed to get push token:', error);
    return null;
  }
}

export async function saveTokenToSupabase(token: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, push_token: token }, { onConflict: 'id' });

  if (error) {
    console.warn('[Notifications] Failed to save token to Supabase:', error.message);
  }
}

const DAILY_REMINDER_KEY = 'daily_reminder_9h';

export async function scheduleDailyReminder(): Promise<string | null> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const existing = scheduled.find((n) => n.content.data?.key === DAILY_REMINDER_KEY);
    if (existing) {
      await Notifications.cancelScheduledNotificationAsync(existing.identifier);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bom dia! ☀️',
        body: 'Veja o que fazer hoje na sua casa 🏠',
        sound: true,
        data: { key: DAILY_REMINDER_KEY },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });

    return id;
  } catch (error) {
    console.warn('[Notifications] Failed to schedule daily reminder:', error);
    return null;
  }
}

export async function scheduleRoutineReminder(
  routine: RoutineReminder,
): Promise<string | null> {
  try {
    const now = new Date();
    const oneHourBefore = new Date(routine.deadline.getTime() - 60 * 60 * 1000);
    const fireAt = oneHourBefore > now ? oneHourBefore : new Date(now.getTime() + 5 * 60 * 1000);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rotina pendente 🔔',
        body: `"${routine.name}" está quase no prazo. Hora de agir!`,
        sound: true,
        data: { routineId: routine.id, key: `routine_${routine.id}` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });

    return id;
  } catch (error) {
    console.warn('[Notifications] Failed to schedule routine reminder:', error);
    return null;
  }
}

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
