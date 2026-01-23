<template>
  <div class="container">
    <h1>Nuxt Scramble Playground</h1>

    <section>
      <h2>Automatic Scrambling (via Nitro plugin)</h2>
      <p>
        These are automatically detected and scrambled on the server, then
        decoded to accessible links:
      </p>

      <div class="example">
        <h3>Email addresses -> mailto: links</h3>
        <p>Contact us at contact@example.com for more information.</p>
        <p>Or reach out to support@examplec.om for support.</p>
      </div>

      <div class="example">
        <h3>Phone numbers -> tel: links</h3>
        <p>Call us: +1 123-456-789</p>
        <p>Other Number: +43 1234567891</p>
        <p>Another Number: (555) 569-6969</p>
      </div>

      <div class="example">
        <h3>Manual tel: links (href attribute scrambling)</h3>
        <p>
          Manual link:
          <a href="tel:+39 123 456 7895">+39 123 456 7895</a>
        </p>
        <p>
          Manual mailto:
          <a href="mailto:manual@example.com">manual@example.com</a>
        </p>
      </div>

      <div class="example">
        <h3>Custom Regex (see nuxt.config.ts)</h3>
        <p>ssn: 123-45-6789</p>
      </div>
    </section>

    <section>
      <h2>Component Usage</h2>
      <p>Using the &lt;ScrambleText&gt; component for explicit control:</p>

      <div class="example">
        <p>
          Email (auto-linked):
          <ScrambleText text="explicit@example.com" type="email" />
        </p>
        <p>
          Phone (auto-linked):
          <ScrambleText text="+1 800-555-0199" type="phone" />
        </p>
        <p>
          Custom text (no link):
          <ScrambleText
            text="I dont want this text to be scraped"
            type="custom"
          />
        </p>
        <p>
          Email without link:
          <ScrambleText text="nolink@example.com" type="email" :link="false" />
        </p>
      </div>
    </section>

    <section>
      <h2>Composable Usage</h2>
      <div class="example">
        <ClientOnly>
          <p>Original: {{ testEmail }}</p>
          <p>XOR Encoded: {{ encoded }}</p>
          <p>Decoded back: {{ decoded }}</p>
          <p>Has email pattern: {{ hasEmail ? "Yes" : "No" }}</p>
          <template #fallback>
            <p>Original: <span class="scrambled">Loading...</span></p>
            <p>XOR Encoded: <span class="scrambled">Loading...</span></p>
            <p>Decoded back: <span class="scrambled">Loading...</span></p>
            <p>Has email pattern: <span class="scrambled">Loading...</span></p>
          </template>
        </ClientOnly>
      </div>
    </section>

    <section>
      <h2>View Source Test</h2>
      <p class="hint">
        View the page source to verify emails/phones are XOR-encoded. This
        should defeat most scrapers that dont have js enabled.
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
  font-style: italic;
  color: #999;
}

.scramble-decoded {
  background: #e8f5e9;
  padding: 2px 4px;
  border-radius: 2px;
}

.scramble-link {
  color: #00dc82;
  text-decoration: none;
}

.scramble-link:hover {
  text-decoration: underline;
}

a {
  color: #00dc82;
}
</style>
