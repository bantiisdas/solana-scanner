import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WalletScreen } from "./src/screens/WalletScreen";
import SwapScreen from "./src/screens/SwapScreen";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function App() {
  const [activeTab, setActiveTab] = useState<"wallet" | "swap">("wallet");
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        {activeTab === "wallet" ? <WalletScreen /> : <SwapScreen />}
        <View style={s.tabBar}>
          <TouchableOpacity
            style={s.tab}
            onPress={() => setActiveTab("wallet")}
          >
            <Ionicons
              name={activeTab === "wallet" ? "wallet" : "wallet-outline"}
              size={24}
              color={activeTab === "wallet" ? "#14F195" : "#6B7280"}
            />
            <Text style={[s.tabText, activeTab === "wallet" && s.tabActive]}>
              Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.tab} onPress={() => setActiveTab("swap")}>
            <Ionicons
              name={
                activeTab === "swap"
                  ? "swap-horizontal"
                  : "swap-horizontal-outline"
              }
              size={30}
              color={activeTab === "swap" ? "#14F195" : "#6B7280"}
            />
            <Text style={[s.tabText, activeTab === "swap" && s.tabActive]}>
              Swap
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D0D12",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#16161D",
    borderTopWidth: 1,
    borderTopColor: "#2A2A35",
    paddingBottom: 8,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  tabText: {
    color: "#6B7280",
    fontSize: 12,
  },
  tabActive: {
    color: "#14F195",
  },
});
