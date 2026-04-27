import React, { useState } from "react";

const SearchBarHPUser = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", query);
    // Hook this into your API call or filter logic
  };

  return (
    <div className="ApiSearchBarFrame h-[20vh] w-[90%] flex items-center justify-center">
      <form
        onSubmit={handleSearch}
        className="flex w-[60%] max-w-xl items-center bg-gray-300 rounded-lg shadow-md overflow-hidden"
      >
        <input
          type="text"
          placeholder="Search APIs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow w-[90%] px-4 py-2 text-gray-700 focus:outline-none"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>
    </div>
  );
};


export default SearchBarHPUser
