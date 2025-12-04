# POC Mobile Collect

A modern Expo React Native application for remote data collection that captures **GeoPoint**, **GeoTrace**, and **GeoShape** using `expo-location`.

## Features

- 📍 **GeoPoint** - Capture single geographic locations with coordinates, altitude, and accuracy
- 📏 **GeoTrace** - Track paths/lines with multiple waypoints and distance calculation
- ⬡ **GeoShape** - Define areas/polygons with automatic area and perimeter calculation
- 🚀 **Mock Serverless Backend** - Built-in API simulation for data submission and storage
- 📱 **Modern UI** - Clean, intuitive interface with React Navigation

## Tech Stack

- **Expo SDK 54** - Modern React Native development
- **TypeScript** - Type-safe development
- **expo-location** - GPS and location services
- **React Navigation** - Navigation and routing
- **Mock Serverless API** - Simulated backend for testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator, or Expo Go app on a physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/ifirmawan/poc-mobile-collect.git
cd poc-mobile-collect

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Project Structure

```
poc-mobile-collect/
├── App.tsx                    # Main application entry
├── src/
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useLocation.ts     # Location and tracking hooks
│   │   └── useGeoData.tsx     # Geo data state management
│   ├── navigation/            # Navigation configuration
│   │   └── AppNavigator.tsx   # Stack navigator setup
│   ├── screens/               # Application screens
│   │   ├── HomeScreen.tsx     # Main dashboard
│   │   ├── GeoPointScreen.tsx # Single point capture
│   │   ├── GeoTraceScreen.tsx # Path/line tracking
│   │   └── GeoShapeScreen.tsx # Area/polygon capture
│   ├── services/              # API services
│   │   ├── api.ts             # Simple API service
│   │   └── mockServerlessApi.ts # Full mock backend
│   └── types/                 # TypeScript definitions
│       └── geo.ts             # Geo data types
├── assets/                    # Images and static files
├── app.json                   # Expo configuration
├── package.json               # Project dependencies
└── tsconfig.json              # TypeScript configuration
```

## Geo Data Types

### GeoPoint
A single geographic location:
```typescript
{
  id: string;
  type: 'geopoint';
  coordinate: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
  };
  name?: string;
  description?: string;
  createdAt: string;
}
```

### GeoTrace
A path/line with multiple coordinates:
```typescript
{
  id: string;
  type: 'geotrace';
  coordinates: Coordinate[];
  name?: string;
  description?: string;
  createdAt: string;
}
```

### GeoShape
A polygon/area (closed path):
```typescript
{
  id: string;
  type: 'geoshape';
  coordinates: Coordinate[];
  name?: string;
  description?: string;
  createdAt: string;
}
```

## Mock Serverless API

The app includes a mock serverless backend that simulates API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/collections | Submit a new geo data collection |
| GET | /api/collections | Get all submitted collections |
| GET | /api/collections/:id | Get a specific collection |
| DELETE | /api/collections/:id | Delete a collection |
| POST | /api/collections/:id/sync | Sync a collection |

### Usage Example

```typescript
import { MockServerlessAPI } from './src/services';

// Submit data
const response = await MockServerlessAPI.createCollection(geoDataItems);

// Get all collections
const collections = await MockServerlessAPI.listCollections();

// Configure network simulation
MockServerlessAPI.configureNetwork({
  latencyMs: 500,
  failureRate: 0.1, // 10% failure rate
});
```

## Permissions

The app requires the following permissions:

### iOS
- `NSLocationWhenInUseUsageDescription` - Location access while using the app
- `NSLocationAlwaysAndWhenInUseUsageDescription` - Background location for tracking

### Android
- `ACCESS_COARSE_LOCATION` - Approximate location
- `ACCESS_FINE_LOCATION` - Precise location
- `ACCESS_BACKGROUND_LOCATION` - Background location for tracking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
