export type VideoSegment = {
  type: "image";
  src: string;
  duration: number;
};

export type Scene = {
  keywords?: string;
  duration: number;
};

export function scenesToImages(scenes: Scene[]): VideoSegment[] {
  return scenes.map((scene, index) => {
    const keywords = (scene.keywords || "technology").replace(/[\s,]+/g, "");
    const cleanKeywords = (scene.keywords || "technology").replace(/[\s,]+/g, "-");
    
    // Alternate between Unsplash (primary) and picsum (fallback) per scene
    // This ensures if one source fails, we still get variety
    const useUnsplash = index % 2 === 0;
    
    const src = useUnsplash
      ? `https://source.unsplash.com/featured/1600x900/?${keywords}`
      : `https://picsum.photos/seed/${cleanKeywords}/1600/900`;
    
    return {
      type: "image" as const,
      src,
      duration: scene.duration
    };
  });
}

export default scenesToImages;
