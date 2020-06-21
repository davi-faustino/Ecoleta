import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';
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
  const [initialPosition, setInitialPosition] = useState<initialPosition>({} as initialPosition);
  const [cityUf, setCityUf] = useState<cityUf>({} as cityUf);
  
  useEffect(() => {
    function loadPosition() {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setInitialPosition({latitude, longitude});
        getCityUf(position);
        setloading(false)
      });
    }

    async function getCityUf(position: Position) {
      const { latitude, longitude } = position.coords;
      const key = "127ffa4f8cf44f599fafd5a4b2f22d7c";
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${key}`);
      const {city, state_code} = response.data.results[0].components;
      setCityUf({
        city,
        uf: state_code
      });
    }
    
    loadPosition();
  }, []);
  
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
