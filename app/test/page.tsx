export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Test Page - Application Fonctionne ✅</h1>
      <p>Si vous voyez cette page, l'application Next.js fonctionne sur Vercel.</p>
      <p>Date: {new Date().toISOString()}</p>
    </div>
  );
}

