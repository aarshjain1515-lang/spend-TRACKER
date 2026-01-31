// Initialize Supabase Client
// Using NEW Vercel Supabase Database

const supabaseUrl = 'https://yxuqkdrugtjktrhecdyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dXFrZHJ1Z3Rqa3RyaGVjZHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODUyOTcsImV4cCI6MjA4NTQ2MTI5N30.P-gNYwBRlgr679TAdi7oNLgBPQMDEZqbGUJnWtGttFE';

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
    }
} catch (err) {
    console.error("❌ Supabase Init Failed:", err);
    alert("System Error: Could not connect to database. " + err.message);
}
