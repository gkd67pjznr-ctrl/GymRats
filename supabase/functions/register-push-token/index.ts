import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Supabase client from environment variables
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use service role key for full access
);

interface RegisterPushTokenRequest {
  userId: string;
  token: string;
  deviceInfo?: {
    platform?: string;
    deviceName?: string;
    osVersion?: string;
    appVersion?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { userId, token, deviceInfo }: RegisterPushTokenRequest = await req.json();

    if (!userId || !token) {
      throw new Error('Missing required fields: userId and token');
    }

    console.log(`Registering push token for user ${userId}:`, { token, deviceInfo });

    // Validate the token format (basic Expo push token validation)
    if (!token.startsWith('ExponentPushToken[') || !token.endsWith(']')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid token format. Expected Expo push token format: ExponentPushToken[...]'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Call the database function to register/update the token
    const { data, error } = await supabase.rpc('register_push_token', {
      p_user_id: userId,
      p_token: token,
      p_device_info: deviceInfo
    });

    if (error) {
      console.error('Error calling register_push_token function:', error);
      throw error;
    }

    console.log('Push token registered successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        tokenId: data,
        message: 'Push token registered successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in register-push-token:', error);
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