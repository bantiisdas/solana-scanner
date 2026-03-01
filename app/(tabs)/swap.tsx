import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TOKENS } from "../../src/services/jupiter";

export default function SwapScreen() {
  const [InputToken, setInputToken] = useState(TOKENS.SOL);
  const [outputToken, setOutputToken] = useState(TOKENS.USDC);

  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"input" | "output">("input");

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          <Text style={s.title}>Swap Tokens</Text>

          <View style={[s.card, { marginBottom: 10 }]}>
            <View style={s.cardHeader}>
              <TouchableOpacity style={s.tokenSelector}>
                <View style={[s.tokenIcon, { backgroundColor: "#9945FF" }]}>
                  <Text style={s.tokenIconText}>S</Text>
                </View>
                <Text style={s.tokenName}>{fromToken}</Text>
                <Ionicons name="chevron-down" size={18} color="#888" />
              </TouchableOpacity>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
              >
                <TextInput
                  style={s.amountInput}
                  value={fromAmount}
                  onChangeText={setFromAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </KeyboardAvoidingView>
            </View>
            <View style={s.cardFooter}>
              <Text style={s.balanceText}>Balance: 661 {fromToken}</Text>
              <Text style={s.usdText}>$499.749</Text>
            </View>
          </View>

          <View style={s.arrowContainer}>
            <TouchableOpacity style={s.swapArrow}>
              <Ionicons name="arrow-down" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={[s.card, { marginBottom: 10 }]}>
            <View style={s.cardHeader}>
              <TouchableOpacity style={s.tokenSelector}>
                <View style={[s.tokenIcon, { backgroundColor: "#2775CA" }]}>
                  <Text style={s.tokenIconText}>S</Text>
                </View>
                <Text style={s.tokenName}>{toToken}</Text>
                <Ionicons name="chevron-down" size={18} color="#888" />
              </TouchableOpacity>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
              >
                <TextInput
                  style={s.amountInput}
                  value={toAmount}
                  onChangeText={setFromAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </KeyboardAvoidingView>
            </View>
            <View style={s.cardFooter}>
              <Text style={s.balanceText}>Balance: 0.0661 {toToken}</Text>
              <Text style={s.usdText}>$499.749</Text>
            </View>
          </View>

          <TouchableOpacity style={s.swapBtn}>
            <Text style={s.swapBtnText}>Swap</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  // layout
  safe: {
    flex: 1,
    backgroundColor: "#0D0D12",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // header
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },

  // devnet warning
  devnetWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  devnetText: {
    color: "#F59E0B",
    fontSize: 13,
    flex: 1,
  },

  // token card
  card: {
    backgroundColor: "#1A1A24",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  // token selector
  tokenSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252530",
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenIconText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tokenName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // amount input/output
  amountInput: {
    fontSize: 36,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  outputContainer: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: 44,
  },
  outputText: {
    fontSize: 36,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  labelText: {
    fontSize: 13,
    color: "#6B7280",
    textTransform: "uppercase",
  },

  // swap arrow
  arrowContainer: {
    alignItems: "center",
    marginVertical: -22,
    zIndex: 10,
  },
  swapArrow: {
    backgroundColor: "#0D0D12",
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#1A1A24",
  },

  // quote details
  detailsCard: {
    backgroundColor: "#1A1A24",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailLabel: {
    color: "#6B7280",
    fontSize: 13,
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },

  // buttons
  swapBtn: {
    backgroundColor: "#14F195",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 24,
  },
  swapBtnDisabled: {
    opacity: 0.4,
  },
  swapBtnText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "600",
  },
  connectBtn: {
    backgroundColor: "#9945FF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 24,
  },
  connectBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1A1A24",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A35",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },

  // token option list
  tokenOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A35",
  },
  tokenOptionSelected: {
    backgroundColor: "rgba(20, 241, 149, 0.1)",
  },
  tokenOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tokenOptionSymbol: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  tokenOptionName: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2,
  },
});
