import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// This endpoint gets place details by place_id while keeping API key secure
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
    const placeId = searchParams.get('place_id');
    
    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing place_id parameter' },
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

    // Call Google Places Details API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Only return the formatted address to minimize data exposure
    return NextResponse.json({
      formatted_address: data.result?.formatted_address || null
    });
  } catch (error: any) {
    console.error('Error in place-details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}