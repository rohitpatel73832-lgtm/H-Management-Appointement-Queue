
import api from "./api";

const generatePreConsultationSummary = async (symptoms) => {
  const response = await api.post(
    "/ai/pre-consultation-summary",
    { symptoms }
  );

  return response.data;
};

export { generatePreConsultationSummary };
