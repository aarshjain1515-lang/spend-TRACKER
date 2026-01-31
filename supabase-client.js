
// Initialize Supabase Client

// Configuration
const supabaseUrl = 'https://dgpobgmnjtxnteiegutq.supabase.co';
// Real Anon Key (Updated Feb 1, 2026)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncG9iZ21uanR4bnRlaWVndXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzk1MjMsImV4cCI6MjA4NTQ1NTUyM30.6pj64r3xrFA8njYz4MyW8NFWQb2bFFTXoFDosq0HsCQ';

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

        console.log("✅ Supabase Client Initialized with Real Key");
    }
} catch (err) {
    console.error("❌ Supabase Init Failed:", err);
    alert("System Error: Could not connect to database. " + err.message);
}
