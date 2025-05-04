import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AdminContext from "../../Context/adminContext/createContext.js";
import EventContext from "../../Context/eventContext/createContext.js";

const AdminSocietyPage = () => {
  const { societies, fetchAllSocieties } = useContext(EventContext);
  const { removeSociety } = useContext(AdminContext);
  const [currUniSocieties, setCurrUniSocieties] = useState([]);

  // Function to delete a society
  const deleteSociety = async (id) => {
    await removeSociety(id);
    fetchAllSocieties();
  };

  useEffect(() => {
    const setting = async () => {
      await fetchAllSocieties();
      const id = localStorage.getItem("university_id");
      if (id) {
        const temp = societies.filter((society) => society.university_id == id);
        setCurrUniSocieties(temp);
      } else {
        setCurrUniSocieties(societies);
      }
    };
    setting();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center text-gray-600 mb-4">
        ADMINISTER SOCIETIES
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
        {currUniSocieties.map((society) => (
          <div
            key={society.society_id}
            className="bg-white shadow-md rounded-md p-4"
          >
            {" "}
            <div className="flex flex-col justify-center items-center">
              <h2 className="text-lg font-bold text-gray-600">{society.name}</h2>
              <p className="text-gray-600 mb-2">ID: {society.society_id}</p>
              <p className="text-gray-800 mb-2">
                University ID: {society.university_id}
              </p>
              <p className="text-gray-800 mb-2">Admin ID: {society.admin_id}</p>
              {society.image_url && (
                <img
                  src={society.image_url}
                  alt={society.name}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
              )}
            </div>
            <div className="flex justify-center py-2 items-center gap-3">
              <Link
                to={`update/${society.society_id}`}
                state={society}
                className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded-md"
              >
                Update
              </Link>
              <button
                onClick={() => deleteSociety(society.society_id)}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md ml-2"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <Link
          to="addsociety"
          className="hover:bg-[#005F73] text-lg bg-opacity-75 bg-[#007F9D] text-white px-6 py-2 rounded-md"
        >
          ADD SOCIETY
        </Link>
      </div>
    </div>
  );
};

export default AdminSocietyPage;
