<template>
  <div class="container">
    <h1>Nuxt Scramble Playground</h1>

    <section>
      <h2>Automatic Scrambling (via Nitro plugin)</h2>
      <p>These are automatically detected and scrambled on the server:</p>

      <div class="example">
        <h3>Email addresses:</h3>
        <p>Contact us at contact@example.com for more information</p>
        <p>Or reach out to support@example.com for support</p>
      </div>

      <div class="example">
        <h3>Phone numbers:</h3>
        <p>Call us: +1 123-456-789</p>
        <p>Other Number: +43 1234567891</p>
        <p>Another Number: (555) 569-6969</p>
      </div>
    </section>

    <section>
      <h2>Component Usage</h2>
      <p>Using the &lt;ScrambleText&gt; component for explicit control:</p>

      <div class="example">
        <p>
          Email:
          <ScrambleText text="email@example.com" type="email" />
        </p>
        <p>
          Custom Text:
          <ScrambleText
            text="This is custom text that i dont want scraped"
            type="custom"
          />
        </p>
      </div>
    </section>

    <section>
      <h2>Composable Usage</h2>
      <div class="example">
        <p>Encoded value: {{ encoded }}</p>
        <ClientOnly>
          <p>Decoded back: {{ decoded }}</p>
          <template #fallback>
            <p>Decoded back: <span class="scrambled">Loading...</span></p>
          </template>
        </ClientOnly>
        <p>Has email pattern: {{ hasEmail ? "Yes" : "No" }}</p>
      </div>
    </section>

    <section>
      <h2>View Source Test</h2>
      <p class="hint">
        View the page source to verify emails/phones are scrambled in HTML. They
        should appear as base64 encoded strings, not readable text.
      </p>
    </section>
  </div>
</template>

<script setup>
const { encode, decode, matches } = useScramble();

const testEmail = "test@example.com";
const encoded = encode(testEmail);
const decoded = decode(encoded);
const hasEmail = matches(testEmail);
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

h1 {
  color: #00dc82;
  border-bottom: 2px solid #00dc82;
  padding-bottom: 0.5rem;
}

h2 {
  color: #333;
  margin-top: 2rem;
}

h3 {
  color: #666;
  font-size: 1rem;
}

section {
  margin-bottom: 2rem;
}

.example {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.hint {
  background: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.scrambled {
  background: #ffebee;
  padding: 2px 4px;
  border-radius: 2px;
}

.scramble-decoded {
  background: #e8f5e9;
  padding: 2px 4px;
  border-radius: 2px;
}
</style>
