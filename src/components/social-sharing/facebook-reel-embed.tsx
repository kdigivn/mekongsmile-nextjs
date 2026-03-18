import { memo } from "react";

interface FacebookReelEmbedProps {
  reelUrl: string;
  width?: number;
  height?: number;
}

const FacebookReelEmbed = ({
  reelUrl,
  width = 350,
  height = 600,
}: FacebookReelEmbedProps) => {
  const embedUrl = `https://www.facebook.com/plugins/video.php?height=${height}&width=${width}&href=${encodeURIComponent(
    reelUrl
  )}&show_text=false&t=0`;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <iframe
        src={embedUrl}
        style={{
          border: "none",
          overflow: "hidden",
          width: width,
          height: height,
          backgroundColor: "black",
        }}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default memo(FacebookReelEmbed);
