import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Supabase client from environment variables
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use service role key for full access
);

// Expo Push Notification API endpoint
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushNotificationRequest {
  userId: string;
  payload: {
    type: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    channelId?: string;
  };
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
  badge?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { userId, payload }: PushNotificationRequest = await req.json();

    if (!userId || !payload) {
      throw new Error('Missing required fields: userId and payload');
    }

    console.log(`Sending push notification to user ${userId}:`, payload);

    // 1. Get user's push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (tokensError) {
      console.error('Error fetching user push tokens:', tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log(`No push tokens found for user ${userId}`);
      return new Response(
        JSON.stringify({ success: false, message: 'No push tokens found for user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Create notification record in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || null,
        created_at: new Date().toISOString()
      });

    if (notificationError) {
      console.error('Error creating notification record:', notificationError);
      // Continue anyway - push notification is more important than DB record
    }

    // 3. Prepare Expo push messages
    const messages: ExpoPushMessage[] = tokens.map(token => ({
      to: token.token,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: 'default',
      priority: 'high',
      channelId: payload.channelId,
    }));

    // 4. Send to Expo Push Notification API
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expo API error:', errorText);
      throw new Error(`Expo API responded with status ${response.status}: ${errorText}`);
    }

    const expoResponse = await response.json();
    console.log('Expo API response:', expoResponse);

    // 5. Check for failed tokens and optionally remove them
    if (expoResponse.data) {
      const failures = expoResponse.data.filter((result: any) => result.status === 'error');

      for (const failure of failures) {
        console.error(`Push notification failed for token: ${failure.details?.expoPushToken}, error: ${failure.message}`);

        // If token is invalid, remove it from database
        if (failure.details?.error === 'DeviceNotRegistered' ||
            failure.details?.error === 'InvalidCredentials') {
          const { error: deleteError } = await supabase
            .from('user_push_tokens')
            .delete()
            .eq('token', failure.details.expoPushToken);

          if (deleteError) {
            console.error('Failed to remove invalid token:', deleteError);
          } else {
            console.log(`Removed invalid token: ${failure.details.expoPushToken}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Push notification sent',
        sentToTokens: tokens.length,
        expoResponse
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});