import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return NextResponse.json(
      { error: 'No authorization header' },
      { status: 401 }
    );
  }

  const accessToken = authHeader.replace('Bearer ', '');
  
  // Get optional 'after' parameter for date filtering
  const { searchParams } = new URL(request.url);
  const after = searchParams.get('after');

  try {
    // Build URL with optional after parameter
    let url = 'https://www.strava.com/api/v3/athlete/activities?per_page=200';
    if (after) {
      url += `&after=${after}`;
    }
    
    // Fetch activities from Strava API
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - token may be expired' },
          { status: 401 }
        );
      }
      throw new Error('Failed to fetch activities');
    }

    const activities = await response.json();
    
    // Filter for runs only and ensure they have maps
    const runs = activities.filter(
      (activity: any) => activity.type === 'Run' && activity.map
    );

    return NextResponse.json({
      activities: runs,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activities fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
