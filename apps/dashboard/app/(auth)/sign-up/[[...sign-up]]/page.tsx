"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main
      style={{
        backgroundColor: '#0a0a0a',
        backgroundImage: 'radial-gradient(circle, #2a2a2a 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            fontSize: '32px',
            letterSpacing: '0.1em',
            color: '#ffffff',
            fontWeight: 700,
            marginBottom: '32px',
            fontFamily: 'monospace',
          }}
        >
          Throttlr
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </main>
  );
}
