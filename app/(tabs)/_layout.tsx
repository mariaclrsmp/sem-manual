import { colors } from "@/src/constants/theme";
import { useThemeStore } from "@/src/stores/themeStore";
import { BarChart2, BookOpen, Home, ListTodo } from "lucide-react-native";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const dark = useThemeStore((s) => s.scheme === "dark");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.verde,
        tabBarInactiveTintColor: dark ? "#64748B" : "#9CA3AF",
        tabBarStyle: {
          backgroundColor: dark ? "#1E293B" : "#FFFFFF",
          borderTopColor: dark ? "#334155" : "#E5E7EB",
        },
        tabBarLabelStyle: {
          fontFamily: "Nunito_400Regular",
          alignItems: "center",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          headerShown: false,
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tarefas",
          headerShown: false,
          tabBarIcon: ({ color }) => <ListTodo size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="guides"
        options={{
          title: "Guias",
          headerShown: false,
          tabBarIcon: ({ color }) => <BookOpen size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progresso",
          headerShown: false,
          tabBarIcon: ({ color }) => <BarChart2 size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
