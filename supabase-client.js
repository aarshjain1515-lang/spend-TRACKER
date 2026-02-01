// Initialize Supabase Client
// Using NEW Vercel Supabase Database

const supabaseUrl = 'https://jstlvbwfxbvlwlqgcjoc.supabase.co';
const supabaseKey = 'sb_publishable_bXZWS6C8zyI3pfJA02vqHg_B_dxDOJS';

// Safe Initialization
try {
    if (typeof supabase === 'undefined') {
        console.error("❌ CRITICAL: Supabase SDK not loaded from CDN!");
        alert("System Error: Database connection library failed to load. Please refresh.");
    } else {
        // Initialize
        const client = supabase.createClient(supabaseUrl, supabaseKey);

        // Assign to global window object
        window.supabase = client;

        console.log("✅ Supabase Client Initialized (NEW Vercel Database)");
        console.log("URL:", supabaseUrl);
        console.log("Google Client ID Linked: 4377...uqa5");
    }
} catch (err) {
    console.error("❌ Supabase Init Failed:", err);
    alert("System Error: Could not connect to database. " + err.message);
}
