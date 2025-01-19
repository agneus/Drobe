import * as Linking from "expo-linking";

export const initializeDeeplinks = async (
  setDeepLink: (url: string) => void
) => {
  const initialUrl = await Linking.getInitialURL();
  if (initialUrl) {
    setDeepLink(initialUrl);
  }

  const listener = Linking.addEventListener("url", ({ url }) => {
    setDeepLink(url);
  });

  return () => {
    listener.remove();
  };
};

export const parseDeeplink = (deepLink: string) => {
  const url = new URL(deepLink);
  const params = url.searchParams;

  if (params.get("errorCode")) {
    throw new Error(
      params.get("errorMessage") || "Unknown error during Phantom connection"
    );
  }

  return {
    phantomEncryptionPublicKey: params.get("phantom_encryption_public_key"),
    data: params.get("data"),
    nonce: params.get("nonce"),
    path: url.pathname,
  };
};
