// Initialize Supabase Client
// Uses environment variables for security

// For local development, these will be loaded from .env
// For Vercel deployment, set these in Project Settings > Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dgpobgmnjtxnteiegutq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncG9iZ21uanR4bnRlaWVndXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzk1MjMsImV4cCI6MjA4NTQ1NTUyM30.6pj64r3xrFA8njYz4MyW8NFWQb2bFFTXoFDosq0HsCQ';

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

        console.log("✅ Supabase Client Initialized");
    }
} catch (err) {
    console.error("❌ Supabase Init Failed:", err);
    alert("System Error: Could not connect to database. " + err.message);
}
