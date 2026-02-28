import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useWalletStore } from "../stores/wallet-store";

interface Props {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}
export default function ConnectButton({
  connected,
  connecting,
  publicKey,
  onConnect,
  onDisconnect,
}: Props) {
  console.log(connected, " ", publicKey);

  const isDevnet = useWalletStore((s) => s.isDevnet);
  console.log("Devnet", isDevnet);
  if (connecting) {
    return (
      <View style={[styles.button, styles.connecting]}>
        <ActivityIndicator color="#FFF" />
        <Text style={styles.buttonText}>Connecting...</Text>
      </View>
    );
  }
  if (connected && publicKey) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.connecting]}
        onPress={onDisconnect}
      >
        <Ionicons name="wallet" size={18} color="#14F195" />
        <Text style={styles.connectedText}>
          {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
        </Text>
        <Ionicons name="close-circle-outline" size={16} color="#888" />
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      style={[styles.button, styles.disconnected]}
      onPress={onConnect}
    >
      <Ionicons name="wallet-outline" size={18} color="#FFF" />
      <Text style={styles.buttonText}>Connect Wallet</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  disconnected: {
    backgroundColor: "#9945FF",
  },
  connected: {
    backgroundColor: "#14F19520",
    borderWidth: 1,
    borderColor: "#14F195",
  },
  connecting: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  connectedText: {
    color: "#14F195",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "monospace",
  },
});
