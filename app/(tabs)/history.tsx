import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
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

      const transactionDetails = await Promise.all(
        signatures.map(async (signatureInfo) => {
          const transaction = await connection.getTransaction(
            signatureInfo.signature
          );

          let memoData = null;
          if (transaction) {
            const { accountKeys, instructions } =
              transaction.transaction.message;

            instructions.forEach((instruction) => {
              const programId = accountKeys[instruction.programIdIndex];
              if (
                programId.toString() ===
                "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
              ) {
                try {
                  console.log("Raw base64 instruction data:", instruction.data);

                  const memo = Buffer.from(instruction.data, "base64").toString(
                    "utf8"
                  );

                  console.log("Decoded memo (UTF-8):", memo);

                  memoData = parseJSON(memo);
                } catch (error) {
                  console.error("Failed to decode or parse memo:", error);
                }
              }
            });
          }

          return {
            signature: signatureInfo.signature,
            blockTime: signatureInfo.blockTime,
            memoData,
          };
        })
      );

      setTransactions(transactionDetails);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseJSON = (data: string) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn("Non-JSON memo data:", data);
      return null;
    }
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transaction}>
      <Text style={styles.signature}>Signature: {item.signature}</Text>
      <Text style={styles.date}>
        Date:{" "}
        {item.blockTime ? new Date(item.blockTime * 1000).toString() : "N/A"}
      </Text>
      {item.memoData ? (
        <>
          <Text style={styles.metadata}>Gender: {item.memoData.gender}</Text>
          <Text style={styles.metadata}>
            Fit Rating: {item.memoData.fitRating}/10
          </Text>
        </>
      ) : (
        <Text style={styles.noMetadata}>No metadata available</Text>
      )}
    </View>
  );

  if (!walletAddress) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Please connect your wallet to view history.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.signature}
      renderItem={renderTransaction}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 20,
  },
  message: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  transaction: {
    backgroundColor: "#1e1e2e",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  signature: {
    color: "#fff",
    fontSize: 14,
  },
  date: {
    color: "#aaa",
    fontSize: 12,
  },
  metadata: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
  },
  noMetadata: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 5,
    fontStyle: "italic",
  },
});
