import GameScreen from "./components/GameScreen";
import LoginScreen from "./components/LoginScreen";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { identity } = useInternetIdentity();

  // Show login if not authenticated
  if (!identity) {
    return <LoginScreen />;
  }

  return <GameScreen />;
}
