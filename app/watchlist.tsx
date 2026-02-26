import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWalletStore } from "../src/stores/wallet-store";
import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface WatchListItem {
  address: string;
  balance: number | null;
  loading: boolean;
}

export default function WatchList() {
  const [watclistItems, setWatclistItems] = useState<WatchListItem[]>([]);
  const favorites = useWalletStore((s) => s.favorites);
  const removeFavorite = useWalletStore((s) => s.removeFavorite);
  const isDevnet = useWalletStore((s) => s.isDevnet);

  const rpcUrl = isDevnet
    ? process.env.EXPO_PUBLIC_ALCHAMY_DEVNET_API_KEY
    : process.env.EXPO_PUBLIC_ALCHAMY_API_KEY;

  const fetchBalances = useCallback(async () => {
    console.log(favorites);
    const result = await Promise.all(
      favorites.map(async (addr) => {
        try {
          const responce = await fetch(rpcUrl!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getBalance",
              params: [
                addr,
                {
                  commitment: "finalized",
                },
              ],
            }),
          });

          const json = await responce.json();

          return {
            address: addr,
            balance: json.result.value / 1e9,
            loading: false,
          };
        } catch (error: any) {
          console.log(error.message);
          return { address: addr, balance: null, loading: false };
        }
      }),
    );

    console.log(result);
    setWatclistItems(result);
  }, [favorites, rpcUrl]);

  useEffect(() => {
    if (favorites.length > 0) {
      setWatclistItems(
        favorites.map((a) => ({ address: a, balance: null, loading: true })),
      );
      fetchBalances();
    }
  }, [favorites, fetchBalances]);

  const shortAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.container}>
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={s.title}>Watchlist</Text>
        <Text style={s.subtitle}>
          {favorites.length} Wallet{favorites.length > 0 ? "s" : ""} ·{" "}
          {isDevnet ? "Devnet" : "Mainet"}
        </Text>

        {favorites.length === 0 ? (
          <View style={s.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#2A2A35" />
            <Text style={s.emptyTitle}>No Saved Wallets</Text>
            <Text style={s.emptyText}>
              Search for a wallet and click on the heart icon to save into
              watchlist
            </Text>
          </View>
        ) : (
          <FlatList
            data={watclistItems}
            keyExtractor={(item) => item.address}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.card}
                onPress={() =>
                  Alert.alert(
                    "Remove From Watchlist?",
                    shortAddress(item.address),
                    [
                      {
                        style: "cancel",
                        text: "Cancel",
                      },

                      {
                        style: "destructive",
                        text: "Remove",
                        onPress: () => removeFavorite(item.address),
                      },
                    ],
                  )
                }
              >
                <View style={s.cardLeft}>
                  <View style={s.iconBox}>
                    <Ionicons name="wallet" size={24} color="#FFF" />
                  </View>
                  <Text style={s.cardAddress} numberOfLines={1}>
                    {shortAddress(item.address)}
                  </Text>
                </View>
                <View style={s.cardRight}>
                  {item.loading ? (
                    <ActivityIndicator size="small" color="#14F195" />
                  ) : item.balance !== null ? (
                    <Text style={s.cardBalance}>
                      {item.balance.toFixed(4)} SOL
                    </Text>
                  ) : (
                    <Text style={s.cardError}>Error</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D0D12",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: "#16161D",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A2A35",
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1E1E28",
    alignItems: "center",
    justifyContent: "center",
  },
  cardAddress: {
    color: "#9945FF",
    fontSize: 14,
    fontFamily: "monospace",
  },
  cardRight: {
    alignItems: "flex-end",
  },
  cardBalance: {
    color: "#14F195",
    fontSize: 16,
    fontWeight: "600",
  },
  cardError: {
    color: "#EF4444",
    fontSize: 14,
  },
});
