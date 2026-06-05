import type { ImgHTMLAttributes } from "react";

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
};

export function Image({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  style,
  loading,
  ...props
}: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={{
        ...(fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : null),
        ...style,
      }}
      loading={priority ? "eager" : loading ?? "lazy"}
      decoding="async"
      {...props}
    />
  );
}
