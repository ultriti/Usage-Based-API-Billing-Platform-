import axios from "axios";

// Utility function to fetch provider APIs
export const fetchProviderApis = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/provider/getProviderApi",
      { withCredentials: true } // include cookies if needed
    );
    return response.data; // return the JSON payload
  } catch (error) {
    console.error("Error fetching provider APIs:", error);
    throw error; // rethrow so caller can handle
  }
};
