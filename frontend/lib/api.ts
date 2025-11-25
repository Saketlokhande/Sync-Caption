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
  dimensions: { width: number; height: number },
  brollSegments?: BrollSegment[]
) => {
  const response = await axios.post(`${API_URL}/render`, {
    videoUrl,
    captions,
    style,
    duration,
    dimensions,
    brollSegments,
  });
  return response.data;
};

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  image: string;
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
    fps: number;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
    nr: number;
  }>;
}

export interface PexelsSearchResponse {
  videos: PexelsVideo[];
  page: number;
  per_page: number;
  total_results: number;
  next_page?: number;
}

export interface BrollSegment {
  videoUrl: string;
  startMinutes: number;
  startSeconds: number;
  endMinutes: number;
  endSeconds: number;
}

export const searchPexelsVideos = async (
  query: string,
  page: number = 1,
  perPage: number = 15
): Promise<PexelsSearchResponse> => {
  const response = await axios.get(`${API_URL}/pexels/search`, {
    params: { query, page, per_page: perPage },
  });
  return response.data;
};

export const getPopularPexelsVideos = async (
  page: number = 1,
  perPage: number = 15
): Promise<PexelsSearchResponse> => {
  const response = await axios.get(`${API_URL}/pexels/popular`, {
    params: { page, per_page: perPage },
  });
  return response.data;
};
