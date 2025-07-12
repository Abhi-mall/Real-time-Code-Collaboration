import React from "react";
import Avatar from "react-avatar";

const Client = ({ username }) => {
  return (
    <div className="flex items-center gap-3 px-2 py-1 bg-gray-800 rounded-md shadow-sm">
      <Avatar name={username.toString()} size="40" round="10px" />
      <span className="text-white font-medium">{username.toString()}</span>
    </div>
  );
};

export default Client;
