<template>
  <div>
    <div>Test</div>

    <!-- Automatic scrambling -->
    <p id="auto-email">Email: contact@test.com</p>
    <p id="auto-phone">Phone: +1 123-456-7891</p>
    <p id="auto-multi">Reach us at multi@test.com or call +49 123 456789</p>

    <!-- ScrambleText component -->
    <span id="comp-email">
      <ScrambleText text="component@example.com" type="email" />
    </span>
    <span id="comp-phone">
      <ScrambleText text="+44 20 7946 0958" type="phone" />
    </span>
    <span id="comp-custom">
      <ScrambleText text="secret-data-123" type="custom" />
    </span>
    <span id="comp-nolink">
      <ScrambleText text="nolink@example.com" type="email" :link="false" />
    </span>

    <!-- Composable usage -->
    <ClientOnly>
      <div id="composable-test">
        <span id="encoded">{{ encoded }}</span>
        <span id="decoded">{{ decoded }}</span>
        <span id="matches-email">{{ matchesEmail }}</span>
        <span id="matches-text">{{ matchesText }}</span>
      </div>
      <template #fallback>
        <div id="composable-fallback">loading</div>
      </template>
    </ClientOnly>

    <!-- Edge cases -->
    <a href="mailto:existing@link.com">Existing mailto</a>
    <a href="tel:+1234567890">Existing tel</a>
    <input type="email" placeholder="user@placeholder.com" />
  </div>
</template>

<script setup>
const { encode, decode, matches } = useScramble();
const testEmail = "composable@test.com";
const encoded = encode(testEmail);
const decoded = decode(encoded);
const matchesEmail = matches("check@email.com");
const matchesText = matches("plain text");
</script>
