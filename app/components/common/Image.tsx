import { FALLBACK_IMAGE_URL } from '@utils/constants';
import Image from 'next/image';
import { MouseEventHandler, useEffect, useState } from 'react';

type CommonImageProps = {
    src: string;
    alt: string;
    classNames?: string;
    onClick?: MouseEventHandler<HTMLImageElement> | undefined;
}

export function FallbackImage({
    src,
    alt,
    onClick
}: CommonImageProps){
    return (
    <Image
        className="h-10 w-10 rounded-full object-cover"
        placeholder="blur"
        blurDataURL="https://res.cloudinary.com/aa1997/image/upload/v1720130142/Web3-Client-Projects/Gm.png"
        src={src}
        alt={alt}
        height={50}
        width={50}
        priority={false}
        onClick={onClick}
    />
    );
}

export function OptimizedImage({
    src,
    alt,
    onClick,
    classNames
}: CommonImageProps){
    const [imageUrl, setImageUrl] = useState<string>(src)

    return (
        <Image
            className={classNames ? classNames : "h-10 w-10 rounded-full object-cover"}
            src={imageUrl ?? ""}
            alt={alt}
            height={50}
            width={50}
            priority={false}
            onClick={onClick}
            onError={() => {
                if(imageUrl != FALLBACK_IMAGE_URL)
                 setImageUrl(FALLBACK_IMAGE_URL);
            }}
            loading="lazy"
        />
    );
}
