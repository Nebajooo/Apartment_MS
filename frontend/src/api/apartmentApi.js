import api from "./axios";

export const getApartments = async () => {
  const response = await api.get("/apartments");
  return response.data;
};

export const getAvailableApartments = async () => {
  const response = await api.get("/apartments/available");
  return response.data;
};
