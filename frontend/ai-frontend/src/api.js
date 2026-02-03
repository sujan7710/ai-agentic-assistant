import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const chatWithAI = (message) =>
  API.post("/chat", { message });

export const fullCodeReview = (repo_url) =>
  API.post("/full-code-review", { repo_url });

export const uploadFilesForAnalysis = (files) => {
  const formData = new FormData();
  for (let f of files) formData.append("files", f);

  return API.post("/explain-file", formData);
};
