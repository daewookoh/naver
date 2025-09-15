import Image, { type StaticImageData } from "next/image";
import React from "react";

export type NamuImageProps = {
  src: string | StaticImageData;
  alt?: string;
  className?: string;
};

const NamuImage = (props: NamuImageProps) => {
  const { src, alt, className } = props;

  return (
    <div className={`relative h-[100px] w-[100px] ${className}`}>
      <Image
        src={src}
        alt={alt ?? ""}
        fill
        className={`h-full w-full rounded-[20px] object-cover`}
      />
    </div>
  );
};

export default NamuImage;
