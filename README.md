# nuxt-scramble

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt module that obfuscates emails, phone numbers and custom text patterns in your HTML to help prevent scraping. Works by encoding sensitive data at build time with XOR encryption and decoding it client side.

> [!NOTE]
> This wont stop scrapers with JS enabled, but it raises the bar significantly for simple HTML scrapers

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
  <!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-scramble?file=playground%2Fapp.vue) -->
  <!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- Automatic detection and obfuscation of emails and phone numbers in your HTML
- Server side rendering with encoded fallbacks for better SEO
- Client side decoding
- Automatic link generation (`mailto:` and `tel:`)
- Custom regex patterns for protecting other sensitive data
- Component and composable for more control
- New encryption key generated per build

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxt module add nuxt-scramble
```

That's it! You can now use nuxt-scramble in your Nuxt app ✨

## How It Works

1. At build time, a random XOR encryption key is generated
2. Matching patterns in HTML are encoded with this key on the server
3. SSR renders a placeholder with the encoded data in a `data-scramble` attribute
4. Client side JS decodes and replaces the placeholder with the real content
5. A new key is generated for each build, making it harder for scrapers

## Usage

### Automatic

By default, the module automatically finds and scrambles emails and phone numbers in your rendered HTML:

```vue
<template>
  <p>Contact us at contact@example.com</p>
  <p>Call us: +1 123-456-7891</p>
</template>
```

These will be automatically converted to clickable links and protected from scrapers.

### ScrambleText Component

For explicit control, use the `<ScrambleText>` component:

```vue
<template>
  <ScrambleText text="contact@example.com" type="email" :link="false" />
  <ScrambleText text="+1 123-456-7891" type="phone" />
  <ScrambleText text="I dont want this scraped" type="custom" />
</template>
```

### useScramble Composable

```typescript
const { encode, decode, matches, patterns } = useScramble();

const encoded = encode("contact@example.com");
const isProtected = matches("test@test.com"); // true
```

## Configuration

```typescript
export default defineNuxtConfig({
  modules: ["nuxt-scramble"],
  scramble: {
    // include default email/phone patterns (default: true)
    defaultPatterns: true,

    // optional custom patterns
    patterns: [
      {
        name: "custom",
        pattern: "\\d{3}-\\d{2}-\\d{4}",
        // optional regex flags, see https://www.w3schools.com/js/js_regexp_flags.asp
        flags: "gi",
      },
    ],

    // customize data attribute (default: 'data-scramble')
    attribute: "data-scramble",

    // CSS class for scrambled elements (default: 'scrambled')
    className: "scrambled",

    // auto generate mailto:/tel: links (default: true)
    autoLink: true,

    // placeholder text for no-JS fallback (default: '[protected]')
    placeholder: "[protected]",
  },
});
```

## Contribution

<details>
  <summary>Local development</summary>

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the playground
pnpm run dev:build

# Run ESLint
pnpm run lint

# Run Vitest
pnpm run test
pnpm run test:watch

# Release new version
pnpm run release
pnpm run release:major
```

</details>

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-scramble/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-scramble
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-scramble.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-scramble
[license-src]: https://img.shields.io/npm/l/nuxt-scramble.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-scramble
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
