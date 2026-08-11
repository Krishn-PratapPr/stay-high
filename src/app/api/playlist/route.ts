import { NextResponse } from "next/server";

interface PlaylistItemSnippet {
  resourceId: {
    videoId: string;
  };
  title: string;
  videoOwnerChannelTitle?: string;
  thumbnails?: {
    high?: {
      url: string;
    };
    default?: {
      url: string;
    };
  };
}

interface PlaylistItem {
  snippet: PlaylistItemSnippet;
}

interface YouTubePlaylistResponse {
  items?: PlaylistItem[];
  error?: any;
}

export async function GET() {
  try {
    const PLAYLIST_ID = "PLMHaYk32qFIvfutXLutU7WwS2t9YYkePt"; // Strictly the playlist ID string (e.g., "PL...")
    const API_KEY = process.env.YOUTUBE_API_KEY;

    if (!API_KEY) {
      console.error("[API Error] YOUTUBE_API_KEY is missing in .env.local");
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`
    );
    const data: YouTubePlaylistResponse = await res.json();

    if (!res.ok) {
      console.error("[YouTube API Error]", data);
      return NextResponse.json({ error: "YouTube API request failed" }, { status: res.status });
    }

    const tracks = (data.items || []).map((item) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      artist: item.snippet.videoOwnerChannelTitle || "Unknown Artist",
      artwork_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "/images/theme1.jpg",
      audio_url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
    }));

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("[API Route Crash]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
