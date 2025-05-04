import { useContext, useEffect, useState } from "react";
import UserContext from "../../Context/userContext/createContext.js";
import { useNavigate } from "react-router-dom";
import UCRContext from "../../Context/uniContestRegistrationContext/createContext.js";

const Signup = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    isStudent: false,
    university_id: "",
  });

  const { universities, fetchAllUniversities } = useContext(UCRContext);
  const { signup } = useContext(UserContext);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUniversities();
  }, []);

  const validateInputs = () => {
    const validationErrors = {};
    if (!inputs.username.trim()) {
      validationErrors.username = "Username is required";
    }
    if (!inputs.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(inputs.email)) {
      validationErrors.email = "Invalid email format";
    }
    if (!inputs.password) {
      validationErrors.password = "Password is required";
    }
    if (!inputs.confirmpassword) {
      validationErrors.confirmpassword = "Confirm Password is required";
    } else if (inputs.password !== inputs.confirmpassword) {
      validationErrors.confirmpassword = "Passwords do not match";
    }

    if (inputs.isStudent) {
      // Check if university_id exists and is not empty
      if (!inputs.university_id || inputs.university_id.trim() === "") {
        validationErrors.university_id = "Please select a university";
      } else {
        // Check if university_id is a valid number
        const uniId = parseInt(inputs.university_id);
        if (isNaN(uniId)) {
          validationErrors.university_id = "Invalid university selection";
        }
      }
    }
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setMessage("Processing signup...");

    try {
      const result = await signup(inputs);

      // If result is a number (HTTP status code)
      if (typeof result === "number") {
        if (result === 201) {
          setMessage("Signup successful! Redirecting to login...");
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        } else {
          setMessage(`Error: Unexpected status code ${result}`);
        }
      }
      // If result is an object with error information
      else if (result && result.error) {
        setMessage(result.error);
      }
      // If result is an object with response.data.error
      else if (result && result.response && result.response.data) {
        setMessage(result.response.data.error);
      } else {
        setMessage("An unknown error occurred");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setMessage("An unexpected error occurred");
    }
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleStudentChange = (e) => {
    const isStudent = e.target.value === "Yes";
    setInputs({ ...inputs, isStudent, university_id: "" });
    setErrors({ ...errors, university_id: "" });
  };

  return (
    <>
      <div
        className="flex flex-col items-center justify-center mx-auto h-screen w-screen bg-slate-300"
        style={{ border: "2px solid red" }}
      >
        <div className="max-w-md min-w-[20rem] p-6 rounded-3xl shadow-2xl bg-gray-100 backdrop-filter backdrop-blur-lg">
          <h1 className="text-3xl font-semibold text-center text-gray-300">
            <span className="text-gray-600">Signup - </span>
            <span className="text-blue-500"> Socio</span>
            <span className="text-red-500">Verse</span>
          </h1>

          {message && <p className="text-red-500 font-bold">{message}</p>}

          <form onSubmit={handleSubmit}>
            <div>
              <label className="label p-2">
                <span className="text-base label-text text-gray-600 font-semibold"></span>
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter Username"
                value={inputs.username}
                onChange={handleChange}
                className="w-full input h-10 input-bordered bg-transparent"
              />
              {errors.username && (
                <p className="text-red-600 font-bold">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="label p-2">
                <span className="text-base label-text font-semibold">
                  {/* Email */}
                </span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={inputs.email}
                onChange={handleChange}
                className="w-full input h-10 input-bordered bg-transparent"
              />
              {errors.email && (
                <p className="text-red-600 font-bold">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="text-base label-text font-semibold text-gray-600">
                  {/* PASSWORD */}
                </span>
              </label>
              <input
                type="password"
                name="password"
                value={inputs.password}
                onChange={handleChange}
                className="w-full input input-bordered h-10 bg-white"
                placeholder="Enter Password"
              />
              {errors.password && (
                <p className="text-red-600 font-bold">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="label">
                <span className="text-base label-text font-semibold">
                  {/* Confirm Password */}
                </span>
              </label>
              <input
                type="password"
                name="confirmpassword"
                value={inputs.confirmpassword}
                onChange={handleChange}
                className="w-full input input-bordered h-10 bg-white"
                placeholder="Confirm Password"
              />
              {errors.confirmpassword && (
                <p className="text-red-600 font-bold">
                  {errors.confirmpassword}
                </p>
              )}
            </div>

            {/* Are you a Student? */}
            <div>
              <label className="label p-2">
                <span className="text-base label-text font-semibold text-gray-500">
                  Are you a Student?
                </span>
              </label>
              <div className="flex ml-3 space-x-4 justify-start items-center">
                <label>
                  <input
                    type="radio"
                    name="isStudent"
                    value="Yes"
                    checked={inputs.isStudent}
                    onChange={handleStudentChange}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="isStudent"
                    value="No"
                    checked={!inputs.isStudent}
                    onChange={handleStudentChange}
                  />
                  No
                </label>
              </div>
            </div>

            {/* University Dropdown */}
            {inputs.isStudent && (
              <div>
                <label className="label p-2">
                  <span className="text-base label-text font-semibold">
                    Select University
                  </span>
                </label>
                <select
                  name="university_id"
                  value={inputs.university_id}
                  onChange={handleChange}
                  className="w-full input h-10 input-bordered"
                >
                  <option value="">Select University</option>
                  {universities.map((university) => (
                    <option
                      key={university.university_id}
                      value={university.university_id}
                    >
                      {university.name}
                    </option>
                  ))}
                </select>
                {errors.university_id && (
                  <p className="text-red-600 font-bold">
                    {errors.university_id}
                  </p>
                )}
              </div>
            )}

            <div>
              <button
                className="btn btn-block btn-sm mt-2 border-0 bg-[#005F73] text-white bg-opacity-70 hover:bg-[#005F73] font-semibold"
                type="submit"
              >
                SIGNUP
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
