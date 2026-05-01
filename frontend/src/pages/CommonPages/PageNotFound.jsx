import React from 'react'
import { Link } from 'react-router-dom';
import PageDecoration from '../../components/providerComponents/PageDecoration';

const PageNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[100vh] w-full bg_dark_Theme_70">
      <PageDecoration/>

      <h1 className="text-6xl font-bold text-cyan-500">404</h1>
      <p className="mt-4 text-xl text-gray-700">Oops! Page not found.</p>
      <Link
        to="/"
        className="mt-6 px-6 py-2 cursor-pointer text-white bg-cyan-500 rounded-lg shadow hover:bg-cyan-600"
      >
        Go Home
      </Link>
    </div>
  );
};


export default PageNotFound
