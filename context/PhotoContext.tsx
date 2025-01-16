import React, { createContext, useContext, useState, ReactNode } from "react";

interface PhotoContextType {
  photo: string | null;
  setPhoto: (uri: string) => void;
  clearPhoto: () => void;
}

const PhotoContext = createContext<PhotoContextType | null>(null);

export const PhotoProvider = ({ children }: { children: ReactNode }) => {
  const [photo, setPhotoState] = useState<string | null>(null);

  const setPhoto = (uri: string) => {
    setPhotoState(uri);
    console.log("Photo URI: ", uri);
  };
  const clearPhoto = () => setPhotoState(null);

  return (
    <PhotoContext.Provider value={{ photo, setPhoto, clearPhoto }}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhoto = (): PhotoContextType => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhoto must be used within a PhotoProvider");
  }
  return context;
};
