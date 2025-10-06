import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.leastric.com/api';
  const healthUrl = `${baseUrl}/v1/health`;

  let backendHealth = null;
  let overallStatus = 'ok';
  let httpStatus = 200;

  try {
    const response = await fetch(healthUrl);
    backendHealth = {
      url: healthUrl,
      status: response.ok ? 'ok' : 'error',
      statusCode: response.status,
    };

    if (!response.ok) {
      overallStatus = 'degraded';
      httpStatus = 503;
    }
  } catch (error) {
    console.error('Failed to reach backend:', error);
    backendHealth = {
      url: healthUrl,
      status: 'error',
      error: 'Failed to reach backend',
    };
    overallStatus = 'error';
    httpStatus = 503;
  }

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      backend: backendHealth,
    },
    { status: httpStatus }
  );
}