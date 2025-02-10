## Drobe

Drobe is a sophisticated mobile application built with Expo, React Native, and Solana blockchain integration. This project showcases a complex side project that leverages various modern technologies and tools to provide a seamless user experience for capturing photos, analyzing outfits, and interacting with the Solana blockchain.

## Table of Contents

- [Drobe](#drobe)
- [Table of Contents](#table-of-contents)
- [Architecture](#architecture)
- [Technologies and Tools Used](#technologies-and-tools-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features](#features)

## Architecture

The architecture of Drobe is designed to be modular and scalable. It consists of several key components:

- **Expo Router**: Manages navigation and routing within the app.
- **Context Providers**: Manages global state for wallet, photo, and analysis contexts.
- **Solana Blockchain Integration**: Handles wallet connections, transactions, and token transfers using the Solana blockchain.
- **AI Service**: Analyzes photos using Google Generative AI to provide outfit analysis and recommendations.
- **UI Components**: Custom components for a consistent and user-friendly interface.

## Technologies and Tools Used

- **React Native**: For building the mobile application.
- **Expo**: For development, building, and deploying the app.
- **Solana**: For blockchain integration, including wallet connections and token transactions.
- **Google Generative AI**: For analyzing photos and providing outfit recommendations.
- **TypeScript**: For type safety and improved developer experience.
- **Jest**: For testing the application.
- **Phantom Wallet**: For connecting and interacting with the Solana blockchain.

## Getting Started

Clone the repository:

```sh
git clone <repository-url>
```

Start the app:

```sh
npm start
```

Open the app:
Use a development build, Android emulator, iOS simulator, or Expo Go to open the app.

## Project Structure

The project structure is organized as follows:

```
- src/
   - components/
   - contexts/
   - screens/
   - services/
   - utils/
- App.tsx
- package.json
```

## Features

- **Photo Capture**: Capture photos using the device camera.
- **Photo Analysis**: Analyze outfits using Google Generative AI and receive detailed feedback.
- **Token Transactions**: Airdrop and transfer tokens on the Solana blockchain.
- **Transaction History**: View transaction history from the connected wallet.
