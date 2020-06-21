import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';
import * as Location from "expo-location";
import axios from "axios";

interface initialPosition {
  latitude: number;
  longitude: number;
}

interface cityUf {
  city: string;
  uf: string;
}

interface LocationContextData {
  cityUf: cityUf;
  initialPosition: initialPosition;
  loading: boolean;
}

const LocationContext = createContext<LocationContextData>({} as LocationContextData);

const LocationProvider: React.FC = ({children}) => {
  const [loading, setloading] = useState(true);
  const [cityUf, setCityUf] = useState<cityUf>({} as cityUf);
  const [initialPosition, setInitialPosition] = useState<initialPosition>({} as initialPosition);

  useEffect(() => {
    async function loadLocation(): Promise<void> {
      await loadPosition();
      
      setloading(false);
    }
    
    loadLocation();
  }, []);

  const loadPosition = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if(status !== 'granted') {
      console.log("Ooooops...", "Precisamos da localização!!!");
      return;
    }
    
    const location = await Location.getCurrentPositionAsync();
    const { latitude, longitude } = location.coords;

    setInitialPosition({
      latitude,
      longitude
    });

    await getCityUf(location.coords);

    return;
  };

  const getCityUf = async (location:initialPosition) => {
    const { latitude, longitude } = location;
    const key = "127ffa4f8cf44f599fafd5a4b2f22d7c";
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${key}`);
    const {city, state_code} = response.data.results[0].components;
    setCityUf({
      city,
      uf: state_code
    });

    return;
  };

  return (
    <LocationContext.Provider
      value={{ cityUf, initialPosition, loading }}
    >
      {children}
    </LocationContext.Provider>
  );
};

function useLocation(): LocationContextData {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useAuth must be used whitin an authProvider');
  }

  return context;
}

export { LocationProvider, useLocation };
