import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // Get the API key from server-side environment variables (no NEXT_PUBLIC prefix)
    // This keeps the key secure as it's only available on the server
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // Security check: Only allow requests from your own domain
    const headersList = headers();
    const referer = headersList.get('referer') || '';
    const host = headersList.get('host') || '';
    
    // Check if the request is coming from a valid source
    // This helps prevent API key theft by restricting access
    const isValidReferer = !referer || referer.includes(host);
    
    if (!isValidReferer) {
      console.warn("Invalid referer detected:", referer);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    console.log("API Key available:", apiKey ? "Yes" : "No");
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }
    
    // Return the API key with short cache time and proper security headers
    return NextResponse.json(
      { apiKey },
      { 
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minute cache
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching Google Maps API key:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API key' },
      { status: 500 }
    );
  }
}