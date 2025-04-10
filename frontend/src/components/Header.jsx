import React, { useState } from 'react'
import { MdOutlineDarkMode, MdLightMode } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex justify-start items-center p-4 bg-white border-b border-gray-100 mb-4">
      <div className="flex items-center space-x-3">
        <div>
          <img
            className="w-10 h-10 rounded-full border-4 border-indigo-400 cursor-pointer"
            src="https://randomuser.me/api/portraits/men/73.jpg"
            alt="User avatar"
          />
        </div>
        <div>
          <h1 className="text-xs text-gray-500">Welcome Back</h1>
          <p className="text-xl font-semibold text-gray-800">Matthew</p>
        </div>
      </div>
    </div>
  )
}

export default Header