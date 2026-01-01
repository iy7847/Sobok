// Follows Supabase Edge Functions structure
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import admin from "npm:firebase-admin@11.11.1";

// Configuration from environment
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID");
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL");
const FIREBASE_PRIVATE_KEY = Deno.env.get("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.error("Missing Firebase configuration");
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: FIREBASE_PRIVATE_KEY,
        }),
    });
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    console.log(`[${new Date().toISOString()}] Received Notification Request`);

    let payload;
    try {
        payload = await req.json();
    } catch (e) {
        console.error("Error parsing JSON:", e);
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
    }

    const { record } = payload;
    const targetUserId = record?.shop_id || record?.user_id;

    if (!record || !targetUserId) {
        console.error("Missing record or target user ID");
        return new Response(JSON.stringify({ error: "Missing record or user_id" }), { status: 400, headers: corsHeaders });
    }

    try {
        // 1. Fetch FCM Tokens for the target user
        const { data: tokens, error: dbError } = await supabase
            .from("user_fcm_tokens")
            .select("token")
            .eq("user_id", targetUserId);

        if (dbError) throw dbError;

        if (!tokens || tokens.length === 0) {
            console.log(`No tokens found for user ${targetUserId}. Skipping.`);
            return new Response(JSON.stringify({ message: "No tokens found" }), { status: 200, headers: corsHeaders });
        }

        const fcmTokens = tokens.map((t: any) => t.token);
        console.log(`Sending to ${fcmTokens.length} devices for user ${targetUserId}`);

        // 2. Construct FCM Message
        const message = {
            data: {
                title: "소복(Sobok) - 새 주문 알림",
                body: `${record.customer_name || "손님"}님의 새로운 주문이 도착했습니다!`,
                orderId: String(record.id),
                url: `/orders`,
            },
            tokens: fcmTokens,
        };

        // 3. Send via Firebase
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log("FCM Summary:", {
            successCount: response.successCount,
            failureCount: response.failureCount
        });

        // 4. Cleanup invalid tokens if any
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp: any, idx: number) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered') {
                        failedTokens.push(fcmTokens[idx]);
                    }
                }
            });

            if (failedTokens.length > 0) {
                console.log(`Cleaning up ${failedTokens.length} stale tokens`);
                await supabase.from("user_fcm_tokens").delete().in("token", failedTokens);
            }
        }

        return new Response(JSON.stringify({ success: true, summary: { success: response.successCount, failure: response.failureCount } }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err: any) {
        console.error("Unexpected Error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
});
