import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req: Request) => {
    try {
        // 1. Calculate the cutoff date (3 months ago)
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        const isoDate = cutoffDate.toISOString();

        console.log(`Cleaning up images for orders created before: ${isoDate}`);

        // 2. Select orders older than 3 months that have custom_data
        // Note: This logic assumes 'created_at' is the relevant date.
        // We only target orders that might have old images.
        // In a real scenario, we might want to flag orders as 'cleaned' to avoid re-processing.
        const { data: orders, error } = await supabase
            .from('Orders')
            .select('id, custom_data')
            .lt('created_at', isoDate)
            .not('custom_data', 'is', null);

        if (error) throw error;
        if (!orders || orders.length === 0) {
            return new Response(JSON.stringify({ message: 'No old orders found to cleanup.' }), { headers: { 'Content-Type': 'application/json' } });
        }

        let deletedCount = 0;
        const filesToDelete: string[] = [];

        // 3. Extract image paths from custom_data
        for (const order of orders) {
            const answers = order.custom_data?.answers;
            if (!answers) continue;

            for (const key in answers) {
                const value = answers[key];
                // Check if value looks like a Supabase Storage URL
                if (typeof value === 'string' && value.includes('/storage/v1/object/public/order-images/')) {
                    // Extract the path after 'order-images/'
                    const path = value.split('/order-images/')[1];
                    if (path) {
                        filesToDelete.push(path);
                    }
                }
            }
        }

        // 4. Delete files from Storage
        if (filesToDelete.length > 0) {
            // Delete in chunks of 50 to allow for API limits if any
            const chunkSize = 50;
            for (let i = 0; i < filesToDelete.length; i += chunkSize) {
                const chunk = filesToDelete.slice(i, i + chunkSize);
                const { error: deleteError } = await supabase.storage
                    .from('order-images')
                    .remove(chunk);

                if (deleteError) {
                    console.error('Error deleting chunk:', deleteError);
                } else {
                    deletedCount += chunk.length;
                }
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Cleanup complete. Processed ${orders.length} orders. Deleted ${deletedCount} images.`
            }),
            { headers: { 'Content-Type': 'application/json' } }
        )

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
})
