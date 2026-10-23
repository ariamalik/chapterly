// Sandbox-only override: when the app is previewed from behind the Base44
// preview proxy, the browser's Origin (https://3000-<public host suffix>) and
// the Host the dev server receives (3000-<sandbox id>.<sandbox host domain>)
// differ, and Next.js blocks dev asset / HMR requests whose origin is not
// allowed. Add those two preview hosts to the dev origin allowlist.
// With BASE44_PREVIEW_MODE unset (or any value other than "1") this stays an
// empty list and Next.js behaves exactly as it does on a normal machine.
const isPreview = process.env.BASE44_PREVIEW_MODE === "1";

const previewOrigins = isPreview
  ? [
      process.env.BASE44_PUBLIC_HOST_SUFFIX
        ? `3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`
        : null,
      process.env.BASE44_SANDBOX_HOST_DOMAIN
        ? `3000-${process.env.BASE44_SANDBOX_HOST_DOMAIN}`
        : null,
    ].filter(Boolean)
  : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: previewOrigins,
};

export default nextConfig;
