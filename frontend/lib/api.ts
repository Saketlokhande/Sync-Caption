import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Caption {
  text: string;
  start: number;
  end: number;
}

export const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${API_URL}/upload`, formData);
  return response.data;
};

export const transcribeVideo = async (filename: string) => {
  const response = await axios.post(`${API_URL}/transcribe`, { filename });
  return response.data;
};

export const renderVideo = async (
  videoUrl: string,
  captions: Caption[],
  style: string,
  duration: number,
  dimensions: { width: number; height: number }
) => {
  const response = await axios.post(`${API_URL}/render`, {
    videoUrl,
    captions,
    style,
    duration,
    dimensions,
  });
  return response.data;
};
