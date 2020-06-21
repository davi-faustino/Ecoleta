import React, {useEffect, useState} from 'react';
import Constants from 'expo-constants';
import { Feather as Icon } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Slider,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker, Circle } from "react-native-maps";
import { SvgUri } from "react-native-svg";
import Haversine from "haversine";

import api from '../../services/api';
import { useLocation } from '../../hooks/Location';

interface Item {
  id: number;
  name: string;
  image_url: string;
}

interface Point {
  id: number;
  name: string;
  image: string;
  latitude: number;
  longitude: number;
  visible: boolean;
}

const Points = () => {
  const navigation = useNavigation();
  const {cityUf, initialPosition} = useLocation();
  const screenWidth = Math.round(Dimensions.get('window').width);
  
  const [items, setItems] = useState<Item[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [maxArea, setMaxArea] = useState<number>(0);
  
  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    let {city, uf} = cityUf;
    if(maxArea != 0){
      city = '',
      uf = ''
    }
    api.get('points', {
      params: {
        city: city,
        uf: uf,
        items: selectedItems
      }
    }).then(response => {
      if(maxArea != 0) {
        response.data.forEach((point:Point) => {
          point.visible = calculateDistance(point);
        });
      }

      setPoints(response.data);
    });
  }, [maxArea, selectedItems]);

  function calculateDistance(point:Point) {
      const distance = Haversine({
        latitude: initialPosition.latitude,
        longitude: initialPosition.longitude
      }, {
        latitude: point.latitude,
        longitude: point.longitude
      });
      return distance <= maxArea;
  }
    
  function handleNavigateBack() {
    navigation.goBack();
  }
    
  function handleNavigateDetail(id: number) {
    navigation.navigate('Detail', { point_id: id });
  }
    
  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);
    if(alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
      return;
    }

    setSelectedItems([...selectedItems, id]);
  }
  
  function handleMaxArea(max: number) {
    setMaxArea(max);
  }

  return (
    <>
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigateBack} >
        <Icon name="arrow-left" size={20} color="#34cb79" />
      </TouchableOpacity>

      <Text style={styles.title}>Bem vindo.</Text>
      <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          showsUserLocation = { true }
          initialRegion={{
            latitude: initialPosition.latitude,
            longitude: initialPosition.longitude,
            latitudeDelta: 0.014,
            longitudeDelta: 0.014
          }}
        >
          <Circle
            center={{
              latitude: initialPosition.latitude,
              longitude: initialPosition.longitude
            }}
            radius={maxArea * 1000}
            zIndex={1}
            fillColor={'#9cecc145'}
            strokeColor={'#9cecc1'}
          />
            
          {points.map(point => {
            if(point.visible)
            return (
              <Marker
                key={String(point.id)}
                style={ styles.mapMarker }
                onPress={() => handleNavigateDetail(point.id)}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude
                }}
              >
                <View style={styles.mapMarkerContainer}>
                  <Image
                    style={styles.mapMarkerImage}
                    source={{uri: point.image}}
                  />
                  <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                </View>
              </Marker>
            )
          })}
        </MapView>
      </View>
      <View>
        <Text>Distância máxima</Text>
        <Text style={{ width: 50, textAlign: 'center', left: maxArea * (screenWidth-90)/100 }}>{maxArea} Km</Text>
        <Slider
          style={{width: 'auto'}}
          maximumValue={100}
          minimumValue={0}
          step={1}
          onValueChange={(value) => handleMaxArea(value)}
        />
      </View>
    </View>
    <View style={styles.itemsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 20}}
      >
        {items.map(item => (
          <TouchableOpacity
            key={String(item.id)}
            style={[
              styles.item,
              selectedItems.includes(item.id) ? styles.selectedItem : {}
            ]}
            onPress={() => handleSelectItem(item.id)}
            activeOpacity={0.6}
          >
            <SvgUri width={42} height={42} uri={item.image_url} />
            <Text style={styles.itemTitle}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points;