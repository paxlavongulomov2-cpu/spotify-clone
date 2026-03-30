import jsmediatags from "jsmediatags";

export function getMetadata(file: File): Promise<{
  title: string;
  artist: string;
}> {
  return new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: (tag: { tags: any }) => {
        const tags = tag.tags;

        resolve({
          title: tags.title || "Unknown",
          artist: tags.artist || "Unknown",
        });
      },
      onError: (error: any) => {
        reject(error);
      },
    });
  });
}