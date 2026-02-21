import { router } from "expo-router";
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

export default function WalletScreen() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const short = (s: string, n = 4) => `${s.slice(0, n)}....${s.slice(-n)}`;

  const timeAgo = (ts: number) => {
    const sec = Math.floor(Date.now() / 1000) - ts;
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  };

  const rpc = async (method: string, params: any[]) => {
    const res = await fetch(process.env.EXPO_PUBLIC_ALCHAMY_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
    });

    const json = await res.json();
    return json.result;
  };

  const getBalance = async (addr: string) => {
    const result = await rpc("getBalance", [
      address,
      { commitment: "confirmed" },
    ]);
    return result.value / 1000000000;
  };

  const getTokens = async (addr: string) => {
    const result = await rpc("getTokenAccountsByOwner", [
      address,
      {
        programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      },
      {
        commitment: "finalized",
        encoding: "jsonParsed",
      },
    ]);

    return (result.value || [])
      .map((a: any) => ({
        mint: a.account.data.parsed.info.mint,
        amount: a.account.data.parsed.info.tokenAmount.uiAmount,
      }))
      .filter((t: any) => t.amount > 0);
  };

  const getTransactions = async (addr: string) => {
    const result = await rpc("getSignaturesForAddress", [
      address,
      {
        commitment: "finalized",
        limit: 10,
      },
    ]);

    return result.map((s: any) => ({
      sig: s.signature,
      time: s.blockTime,
      ok: !s.err,
    }));
  };

  const handleSearch = async () => {
    const addr = address.trim();
    if (!addr) {
      return Alert.alert("Enter a wallet address");
    }

    setLoading(true);
    try {
      const [walletBalance, txs, userTokens] = await Promise.all([
        getBalance(address),
        getTransactions(address),
        getTokens(address),
      ]);

      setBalance(walletBalance);
      setTransactions(txs);
      setTokens(userTokens);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }

    setLoading(false);
  };

  console.log(transactions, tokens);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView style={s.scroll}>
        <Text style={s.title}>SolScan</Text>
        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            placeholder="Solana Wallet Address"
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            autoCorrect={false}
            value={address}
            onChangeText={setAddress}
            selectTextOnFocus={true}
            editable={true}
          />
        </View>
        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleSearch}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {balance !== null && (
          <View style={s.card}>
            <Text style={s.label}>SOL Balance</Text>
            <View style={s.balanceRow}>
              <Text style={s.balance}>{balance.toFixed(4)}</Text>
              <Text style={s.sol}>SOL</Text>
            </View>
            <Text style={s.addr}>{short(address.trim(), 7)}</Text>
          </View>
        )}

        {tokens.length > 0 && (
          <>
            <Text style={s.section}>Tokens ({tokens.length})</Text>
            <FlatList
              data={tokens}
              keyExtractor={(t) => t.mint}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/token/${item?.mint}`)}
                >
                  <View style={s.row}>
                    <Text style={s.mint}>{short(item.mint, 6)}</Text>
                    <Text style={s.amount}>{item.amount}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {transactions.length > 0 && (
          <>
            <Text style={s.section}>Recent Transactions</Text>
            <FlatList
              data={transactions}
              keyExtractor={(t) => t.sig}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={s.row}>
                  <Text style={s.mint}>{short(item.sig, 6)}</Text>
                  <Text style={s.time}>{timeAgo(item.time)}</Text>
                  <Text
                    style={{
                      color: item.ok ? "#14F195" : "#EF4444",
                      fontSize: 18,
                    }}
                  >
                    {item.ok ? "+" : "-"}
                  </Text>
                </View>
              )}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0D0D12",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
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
    marginBottom: 28,
  },
  inputContainer: {
    backgroundColor: "#16161D",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 14,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    backgroundColor: "#14F195",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#0D0D12",
    fontWeight: "600",
    fontSize: 16,
  },
  btnGhost: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#16161D",
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  btnGhostText: {
    color: "#9CA3AF",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#16161D",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  label: {
    color: "#6B7280",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "700",
  },
  sol: {
    color: "#14F195",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  addr: {
    color: "#9945FF",
    fontSize: 13,
    fontFamily: "monospace",
    marginTop: 16,
    backgroundColor: "#1E1E28",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  section: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 32,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#16161D",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  mint: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "monospace",
  },
  amount: {
    color: "#14F195",
    fontSize: 15,
    fontWeight: "600",
  },
  time: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
  },
});
