import axios from "axios";
import React, { useEffect, useState } from "react";

const ApiRequest = () => {
  const [data, setdata] = useState(null);

  const demo = async () => {
    const url =
      `${import.meta.env.VITE_BACKEND_URL_RD}/api/apiGen/apiRequest?apiName=poekmon`;

    try {
      const response = await axios.get(url, {
        headers: {
          api_provide_key: "u$qYDAlScbcY9EJldH1VWD!*%",
          api_provide_password: "Pl<0VqQ4UP8S",
        },
        withCredentials: true,
      });

      console.log(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    demo();
  }, []);

  return <div>{data ? <>{data.data.count}</> : <></>}</div>;
};

export default ApiRequest;
