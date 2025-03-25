import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

// GET /api/deals - Get all deals for current user
// GET /api/deals?id=xxx - Get a specific deal by ID
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    // Check if we're requesting a specific deal by ID
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      // Looking for a specific deal
      const deal = await prisma.deal.findUnique({
        where: {
          id,
        },
      });
      
      if (!deal) {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      }
      
      return NextResponse.json(deal);
    } else {
      // Get all deals
      const queryParams = {
        orderBy: {
          updatedAt: 'desc' as const,
        },
      };
      
      // If authenticated, filter by user ID
      if (session?.user?.email) {
        // For now, we'll just fetch all deals as we're not associating them with users yet
      }
      
      const deals = await prisma.deal.findMany(queryParams);
      
      return NextResponse.json(deals);
    }
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

// POST /api/deals - Create or update a deal
export async function POST(req: NextRequest) {
  try {
    // Parse the deal data from the request body
    const dealData = await req.json();

    // Check if the deal already exists
    const existingDeal = await prisma.deal.findUnique({
      where: {
        id: dealData.id,
      },
    });

    let deal;

    if (existingDeal) {
      // Update the existing deal
      deal = await prisma.deal.update({
        where: {
          id: dealData.id,
        },
        data: {
          name: dealData.name,
          address: dealData.address,
          strategy: dealData.strategy,
          config: dealData.config,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create a new deal
      deal = await prisma.deal.create({
        data: {
          id: dealData.id,
          name: dealData.name,
          address: dealData.address,
          strategy: dealData.strategy,
          config: dealData.config,
          // Don't require user association for now
          // userId: user.id,
        },
      });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error saving deal:', error);
    return NextResponse.json(
      { error: 'Failed to save deal' },
      { status: 500 }
    );
  }
}

// DELETE /api/deals?id=xxx - Delete a deal
export async function DELETE(req: NextRequest) {
  try {
    // Get the deal ID from the query params
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Deal ID is required' },
        { status: 400 }
      );
    }

    // Check if the deal exists
    const deal = await prisma.deal.findUnique({
      where: {
        id,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Delete the deal without checking user association for now
    await prisma.deal.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
