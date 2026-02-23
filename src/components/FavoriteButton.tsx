import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { Component } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useWalletStore } from "../stores/wallet-store";

interface Prop {
  address: string;
}

export default function ({ address }: Prop) {
  const addFvorite = useWalletStore((s) => s.addFavorite);
  const removeFvorite = useWalletStore((s) => s.removeFavorite);
  const fvorites = useWalletStore((s) => s.favorites);
  const isFavourite = fvorites.includes(address);

  return (
    <TouchableOpacity
      onPress={() => {
        if (isFavourite) removeFvorite(address);
        else addFvorite(address);
      }}
    >
      <Ionicons
        name={isFavourite ? "heart" : "heart-outline"}
        size={24}
        color={isFavourite ? "#FF4545" : "#666"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
