import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../../Context/userContext/createContext.js";
import EventContext from "../../Context/eventContext/createContext.js";

const Navbar = (props) => {
  const { setIsSideMenuOpen, isSideMenuOpen } = props;
  const { logOut, isAuthenticated } = useContext(UserContext);
  const navigate = useNavigate();
  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const logOuttheUser = () => {
    logOut();
    //navigate('/login');
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState({
    societies: [],
    events: [],
  });
  const [showDropdown, setShowDropdown] = useState(false);

  const { societies, events, fetchAllEvents, fetchAllSocieties } =
    useContext(EventContext);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated]);

  useEffect(() => {
    if (!societies || societies.length === 0) fetchAllSocieties();
    if (!events || events.length === 0) fetchAllEvents();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredResults({ societies: [], events: [] });
      setShowDropdown(false);
      return;
    }

    const filteredSocieties = societies.filter((society) =>
      society.name.toLowerCase().includes(query)
    );

    const filteredEvents = events.filter((events) =>
      events.event_name.toLowerCase().includes(query)
    );

    console.log(filteredEvents);
    setFilteredResults({
      societies: filteredSocieties,
      events: filteredEvents,
    });
    setShowDropdown(true);
  };

  const handleResultClick = () => {
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="wrapper">
      <div className="top_nav ">
        <div className="left gap-2">
          <div className="text-white text-3xl pr-5">
            <p style={{ color: "#FFFFFF" }}>
              <span>Socio</span>Verse
            </p>
            {/* <p>SocioVerse</p> */}
          </div>
          <div className="search_bar relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="input input-bordered bg-gray-100"
            />
            {showDropdown && (
              <div className="absolute bg-white border mt-2 shadow-md w-full z-50 rounded-md">
                {filteredResults.societies.length > 0 && (
                  <>
                    <h4 className="px-3 py-2 bg-gray-100 font-bold text-black">
                      Societies
                    </h4>
                    <ul>
                      {filteredResults.societies.map((society) => (
                        <Link
                          to={`/userview/viewsociety/${society.society_id}`}
                          onClick={handleResultClick}
                        >
                          <li
                            key={society.society_id}
                            className="px-3 py-2 hover:bg-gray-200"
                          >
                            {society.name}
                          </li>
                        </Link>
                      ))}
                    </ul>
                  </>
                )}

                {filteredResults.events.length > 0 && (
                  <>
                    <h4 className="px-3 py-2 bg-gray-100 font-bold text-black">
                      Events
                    </h4>
                    <ul>
                      {filteredResults.events.map((event) => (
                        <Link
                          to={`/userview/viewevent/${event.event_id}`}
                          onClick={handleResultClick}
                        >
                          <li
                            key={event.event_id}
                            className="px-3 py-2 hover:bg-gray-200"
                          >
                            {event.event_name}
                          </li>
                        </Link>
                      ))}
                    </ul>
                  </>
                )}

                {filteredResults.societies.length === 0 &&
                  filteredResults.events.length === 0 && (
                    <p className="px-3 py-2 text-gray-500">No results found</p>
                  )}
              </div>
            )}
          </div>
        </div>
        <div className="right">
          <ul>
            <li>
              <button
                className="btn btn-outline hover:text-white  text-black bg-[#fffffF] hover:bg-slate-600 hover:text-[#4F7942] border-0 px-5"
                onClick={logOuttheUser}
              >
                LOGOUT
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="bottom_nav " style={{ background: "#94d2bd" }}>
        <ul className="flex space-x-6">
          <li className="hover:bg-teal-600">
            <Link to="/userview">Home</Link>
          </li>

          {/* Browse Societies */}
          <li>
            <div>
              <button
                className="btn btn-primary bg-transparent border-0 text-white hover:bg-slate-600"
                onClick={toggleSideMenu}
              >
                BROWSE SOCIETIES
              </button>
            </div>
          </li>

          {/* {browse societies end} */}

          <li className="">
            <button className="hover:bg-teal-600 hover:text-white">
              <Link to="viewallevents" className="">
                Events
              </Link>
            </button>
          </li>
          <li className="hover:bg-teal-600 link-">
            <Link to="contactus">CONTACT US</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
