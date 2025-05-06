import React, { useState } from "react";
import { motion } from "framer-motion";

const UserAvatar = ({ src, alt, name, size = "h-10 w-10", className = "" }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitial = () => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const getTextSize = () => {
    if (size.includes("h-32") || size.includes("h-24")) return "text-4xl";
    if (size.includes("h-16") || size.includes("h-14")) return "text-2xl";
    if (size.includes("h-12") || size.includes("h-10")) return "text-lg";
    if (size.includes("h-8")) return "text-sm";
    return "text-xs";
  };

  const baseClasses = `rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 ${size} ${className}`;

  return (
    <div
      className={`relative rounded-full overflow-hidden ${
        size === "sm"
          ? "h-8 w-8"
          : size === "md"
          ? "h-10 w-10"
          : size === "lg"
          ? "h-12 w-12"
          : size
      }`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              name
            )}&background=EF4444&color=fff`;
          }}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center bg-red-500 text-white font-medium"
          style={{
            fontSize: size === "sm" ? "0.875rem" : size === "md" ? "1rem" : "1.25rem",
          }}
        >
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
