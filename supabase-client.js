// Initialize Supabase Client
// Automatically uses Vercel's environment variables

// Vercel automatically injects these from your Supabase integration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || window.location.origin;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Safe Initialization
try {
    if (typeof supabase === 'undefined') {
        console.error("❌ CRITICAL: Supabase SDK not loaded from CDN!");
        alert("System Error: Database connection library failed to load. Please refresh.");
    } else {
        // Initialize with Vercel's environment variables
        const client = supabase.createClient(supabaseUrl, supabaseKey);

        // Assign to global window object
        window.supabase = client;

        console.log("✅ Supabase Client Initialized (Vercel Integration)");
        console.log("URL:", supabaseUrl);
    }
} catch (err) {
    console.error("❌ Supabase Init Failed:", err);
    alert("System Error: Could not connect to database. " + err.message);
}
