export async function fetchAudioTrack(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const blob = new Blob([uint8Array], { type: response.headers.get("Content-Type") ?? "audio/mp3" });
  return URL.createObjectURL(blob);
}