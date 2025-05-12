import { useState, useEffect } from "react";
import { AccountIcon } from "../icons/account";

interface ProfileImgProps {
  imageUrl?: string;
  className?: string;
}

export const ProfileImg = ({ imageUrl, className = "" }: ProfileImgProps) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          onError={() => setImageError(true)}
          className="w-full h-full max-w-[32px] max-h-[32px] object-cover rounded"
        />
      ) : (
        <AccountIcon />
      )}
    </div>
  );
};
