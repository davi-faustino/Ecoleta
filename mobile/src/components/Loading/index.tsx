import React from 'react';
import { StyleSheet, ImageBackground, Text, Image } from "react-native";

const Loading: React.FC = () => {
  const images = {
    HomeBackground: require('../../assets/home-background.png'),
    Logo: require('../../assets/logo.png'),
  };

  return (
    <ImageBackground
      source={images.HomeBackground}
      style={styles.container}
      imageStyle={{width: 274, height: 368}}
    >
      <Image source={images.Logo} />
      <Text style={styles.textLoading}>Carregando...</Text>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textLoading: {
    fontSize: 15,
    fontFamily: 'Roboto_400Regular',
    marginTop: 24,
  }
});


export default Loading;