import { type ImgHTMLAttributes } from "react";

interface IProfileInfoCardProps {
  imageUrl?: string;
  imageElement?: React.ReactNode; // in case you want to pass custom <img> or <Avatar />
  fullName: string;
  email: string;
  className?: string;
  imageProps?: ImgHTMLAttributes<HTMLImageElement>;
}

function ProfileInfoCard({
  imageUrl,
  imageElement,
  fullName,
  email,
  className = "",
  imageProps,
}: IProfileInfoCardProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-md ${className}`}>
      {imageElement ? (
        imageElement
      ) : (
        <img
          src={imageUrl}
          alt={fullName}
          {...imageProps}
          className={`w-18 h-18 rounded-full object-cover`}
        />
      )}

      <div className="flex flex-col">
        <span className="font-semibold text-gray-800">{fullName}</span>
        <span className="text-sm text-gray-500">{email}</span>
      </div>
    </div>
  );
}

export default ProfileInfoCard;
