import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function TokenDetailsScreen() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { mint } = useLocalSearchParams<{ mint: string }>();

  const fetchTokenInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch(process.env.EXPO_PUBLIC_ALCHAMY_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenSupply",
          params: [
            mint,
            {
              commitment: "finalized",
            },
          ],
        }),
      });

      const json = await res.json();
      console.log(json);

      setTokenInfo({
        mint: mint,
        supply: json.result?.value?.uiAmountString || 0,
        decimals: json.result?.value?.decimals || 0,
      });
    } catch (error) {
      console.error("Failed to fetch token info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenInfo();
  }, [mint]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#14F195" />
      </View>
    );

  return (
    <SafeAreaProvider>
      {/* Back Button */}
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={router.back}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Token Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Token Details</Text>
        </View>

        {/* Mint Address */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Mint Address</Text>
          <Text style={styles.mintAddress}>{mint}</Text>
        </View>

        {/* Token Info */}
        {tokenInfo && (
          <View style={styles.card}>
            <View></View>
          </View>
        )}
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4cb816",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a1a",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    color: "#888",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  mintAddress: {
    color: "#9945FF",
    fontSize: 13,
    fontFamily: "monospace",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    color: "#888",
    fontSize: 14,
  },
  infoValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a3e",
  },
  linkButton: {
    backgroundColor: "#9945FF20",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  linkButtonText: {
    color: "#9945FF",
    fontSize: 14,
    fontWeight: "600",
  },
});
