import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@/context/WalletContext";

const connection = new Connection("https://api.devnet.solana.com");

export default function HistoryPage() {
  const { walletAddress } = useWallet();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions(walletAddress);
    }
  }, [walletAddress]);

  const fetchTransactions = async (address: string) => {
    try {
      setLoading(true);
      const publicKey = new PublicKey(address);

      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 10,
      });

      const transactionDetails = signatures.map((signatureInfo) => ({
        signature: signatureInfo.signature,
        blockTime: signatureInfo.blockTime,
      }));

      setTransactions(transactionDetails);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transaction}>
      <Text style={styles.signatureLabel}>Transaction Signature:</Text>
      <Text style={styles.signature}>{item.signature}</Text>
      <Text style={styles.dateLabel}>Date:</Text>
      <Text style={styles.date}>
        {item.blockTime
          ? new Date(item.blockTime * 1000).toLocaleString()
          : "N/A"}
      </Text>
    </View>
  );

  if (!walletAddress) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Please connect your wallet to view transaction history.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.message}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.signature}
      renderItem={renderTransaction}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContainer: {
    padding: 20,
    backgroundColor: "#1C1C1E",
  },
  message: {
    color: "#E5E5E5",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  transaction: {
    backgroundColor: "#2C2C2E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  signatureLabel: {
    color: "#8E8E93",
    fontSize: 12,
    marginBottom: 2,
  },
  signature: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  dateLabel: {
    color: "#8E8E93",
    fontSize: 12,
    marginBottom: 2,
  },
  date: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});
