import axios from "axios";

const api = axios.create({
  baseURL: 'https://server.dgspace.com.br/'
});

export default api;