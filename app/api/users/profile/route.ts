import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Get user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'You must be logged in to view your profile' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        annualSavings: true,
        stateOfResidence: true,
        investorType: true,
        investmentGoals: true,
        preferredMarkets: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Error fetching user profile' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'You must be logged in to update your profile' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { 
      name, 
      annualSavings, 
      stateOfResidence, 
      investorType, 
      investmentGoals,
      preferredMarkets 
    } = data;

    // Find user to update
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        annualSavings,
        stateOfResidence,
        investorType,
        investmentGoals,
        preferredMarkets: preferredMarkets || [],
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        annualSavings: true,
        stateOfResidence: true,
        investorType: true,
        investmentGoals: true,
        preferredMarkets: true,
      },
    });

    return NextResponse.json(
      { message: 'Profile updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { message: 'Error updating user profile' },
      { status: 500 }
    );
  }
}