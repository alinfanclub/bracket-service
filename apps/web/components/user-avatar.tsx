"use client";

import Avvvatars from "avvvatars-react";

interface UserAvatarProps {
  avatarValue?: string;
  avatarStyle?: "shape" | "character";
  fallbackImageUrl?: string;
  size?: number;
}

export function UserAvatar({ 
  avatarValue, 
  avatarStyle = "shape", 
  fallbackImageUrl,
  size = 40 
}: UserAvatarProps) {
  if (avatarValue) {
    return (
      <Avvvatars 
        value={avatarValue} 
        style={avatarStyle}
        size={size}
        shadow={false}
      />
    );
  }

  if (fallbackImageUrl) {
    return (
      <img
        src={fallbackImageUrl}
        alt="Profile"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover"
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        color: "#9ca3af"
      }}
    >
      ?
    </div>
  );
}
