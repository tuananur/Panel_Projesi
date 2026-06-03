import prisma from '@/lib/prisma';

export async function getGoogleOAuthConfig(client) {
  const globalSetting = await prisma.setting.findUnique({
    where: { key: 'google_analytics_global_config' },
  });
  const globalConfig = globalSetting ? JSON.parse(globalSetting.value) : {};

  return {
    clientId: globalConfig.clientId,
    clientSecret: globalConfig.clientSecret,
    refreshToken: client?.analyticsRefreshToken || globalConfig.refreshToken,
    propertyId: client?.analyticsPropertyId,
  };
}

export async function refreshGoogleAccessToken({ clientId, clientSecret, refreshToken }) {
  if (!clientId || !clientSecret || !refreshToken) {
    return { error: 'MISSING_CREDENTIALS' };
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    return { error: 'TOKEN_REFRESH_FAILED', details: errText };
  }

  const tokenData = await tokenResponse.json();
  return { accessToken: tokenData.access_token };
}
