import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { updateProfile } from './userService';

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

async function ensureAndroidChannels(): Promise<void> {
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

  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return status === 'granted';
}

const DAILY_REMINDER_KEY = 'daily_reminder_9h';

export async function scheduleDailyReminder(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const existing = scheduled.find((n) => n.content.data?.key === DAILY_REMINDER_KEY);
    if (existing) {
      await Notifications.cancelScheduledNotificationAsync(existing.identifier);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bom dia! ☀️',
        body: 'Veja o que você tem para fazer em casa hoje 🏠',
        sound: true,
        data: { key: DAILY_REMINDER_KEY },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });
  } catch (error) {
    console.warn('[Notifications] scheduleDailyReminder failed:', error);
  }
}

export async function scheduleRoutineReminder(routine: RoutineReminder): Promise<string> {
  const now = new Date();
  const oneHourBefore = new Date(routine.deadline.getTime() - 60 * 60 * 1000);
  const fireAt = oneHourBefore > now
    ? oneHourBefore
    : new Date(now.getTime() + 5 * 60 * 1000);

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
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function savePushToken(userId: string): Promise<void> {
  try {
    if (!Constants.isDevice) return;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn('[Notifications] EAS projectId not found — push token not obtained.');
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (!token) return;

    await updateProfile(userId, { push_token: token });
  } catch (error) {
    console.warn('[Notifications] savePushToken failed:', error);
  }
}
