import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent, icon } from "leaflet";
import * as Joi from "@hapi/joi";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import api from '../../services/api';
import Dropzone from '../../components/Dropzone';
import {useLocation} from '../../hooks/Location';

import './styles.css';


import logo from '../../assets/logo.svg';
import markerHere from '../../assets/here.png';

interface Item {
  id: number;
  name: string;
  image_url: string;
}


const CreatePoint = () => {
  const history = useHistory();
  const MySwal = withReactContent(Swal)
  const {cityUf, initialPosition: {latitude, longitude}} = useLocation();
  const [items, setItems] = useState<Item[]>([]);
  
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const customMarker = icon({
    iconUrl: markerHere
  });

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, []);

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target;

    setFormData({...formData, [name]: value});
  }

  function handleSelectItem(id: number) {
    let filteredItems = [...selectedItems, id];
    
    if(selectedItems.includes(id)) {
      filteredItems = selectedItems.filter(item => item !== id);
    }

    setSelectedItems(filteredItems);
  }

  const schema = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email({ tlds: {allow: false} }),
        whatsapp: Joi.number().required(),
        items: Joi.string().required()
      });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = cityUf.uf;
    const city = cityUf.city;
    const [ latitude, longitude ] = selectedPosition;
    const items = selectedItems.join(',');
    const data = new FormData();

    if(!selectedFile) return MySwal.fire('Erro', 'Selecione uma imagem!', 'error');
    if(!latitude) return MySwal.fire('Erro', 'Selecione um ponto no mapa!', 'error');

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items);
    data.append('image', selectedFile)

    try {
      await schema.validateAsync({name, email, whatsapp, items});
    }
    catch (err) {
      MySwal.fire('Erro', 'Preencha todos os campos!', 'error');

      return;
    }

    await api.post('points', data);

    MySwal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: 'Ponto de coleta cadastrado com sucesso!', 
      timer: 1500,
      showConfirmButton: false
    });

    setTimeout(() => {
      history.push('/');
    }, 1500);
  }

  return (
    <>
      <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta"/>

          <Link to="/">
            <FiArrowLeft />
            Voltar para home
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>Cadastro do <br /> ponto de coleta</h1>

          <Dropzone onFileUploaded={setSelectedFile} />

          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>

            <div className="field">
              <label htmlFor="name">Nome da entidade</label>
              <input
                type="text"
                name="name"
                id="name"
                onChange={handleInputChange}
              />
            </div>

            <div className="field-group">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione um endereço no mapa</span>
            </legend>

            <Map
              center={[latitude, longitude]}
              zoom={15}
              onclick={handleMapClick}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude]} icon={ customMarker } />
              <Marker position={selectedPosition} />
            </Map>
          </fieldset>

          <fieldset>
            <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais ítens abaixo</span>
            </legend>

            <ul className="items-grid">
              {items.map(item => (
                <li
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                >
                  <img src={item.image_url} alt={item.name} />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </fieldset>

          <button type="submit">Cadastrar ponto de coleta</button>
        </form>

      </div>
    </>
  );
};

export default CreatePoint;