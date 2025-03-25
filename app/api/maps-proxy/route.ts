import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// This is a proxy endpoint for Google Maps API
// It helps protect your API key by keeping it server-side
export async function GET(req: NextRequest) {
  try {
    // Get API key from server environment variables
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key not configured in environment variables');
      return NextResponse.json(
        { error: 'Maps service not configured' },
        { status: 500 }
      );
    }

    // Extract query parameters from the request
    const { searchParams } = new URL(req.url);
    const input = searchParams.get('input');
    
    if (!input) {
      return NextResponse.json(
        { error: 'Missing input parameter' },
        { status: 400 }
      );
    }

    // Security check: Only allow requests from your own domain
    // Next.js 14+ needs headers to be used asynchronously
    const headersList = headers();
    const referer = headersList.has('referer') ? headersList.get('referer') as string : '';
    const host = headersList.has('host') ? headersList.get('host') as string : '';
    
    // Check if the request is coming from a valid source
    // In development or if referer is missing, we'll allow the request
    // In production, validate the referer against the host
    const isValidReferer = process.env.NODE_ENV === 'development' || 
                           !referer || 
                           referer.includes(host);
    
    if (!isValidReferer) {
      console.warn("Invalid referer detected:", referer);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Call Google Places Autocomplete API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&components=country:us&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the predictions to only return what we need
    // This prevents exposing unnecessary data to the client
    const formattedPredictions = data.predictions.map((prediction: any) => ({
      description: prediction.description,
      place_id: prediction.place_id
    }));
    
    return NextResponse.json(
      { predictions: formattedPredictions }, 
      { 
        headers: {
          'Cache-Control': 'private, max-age=60', // Cache for 1 minute
        }
      }
    );
  } catch (error: any) {
    console.error('Error in maps-proxy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch address suggestions' },
      { status: 500 }
    );
  }
}