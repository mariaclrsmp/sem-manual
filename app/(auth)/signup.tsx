import { Redirect } from "expo-router";

// Autenticação via Google não distingue cadastro de login
export default function SignupScreen() {
  return <Redirect href="/(auth)/login" />;
}
