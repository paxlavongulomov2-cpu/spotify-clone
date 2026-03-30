import jsmediatags from "jsmediatags";

export function getMetadata(file: File): Promise<{
  title: string;
  artist: string;
}> {
  return new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => {
        const tags = tag.tags;

        resolve({
          title: tags.title || "Unknown Title",
          artist: tags.artist || "Unknown Artist",
        });
      },
      onError: (error) => {
        reject(error);
      },
    });
  });
}