// Twitter/X uses the same share card as Open Graph, so this re-exports the
// generated image rather than duplicating the markup. `app/twitter-image.tsx`
// wires the twitter:image tag automatically.
export { default, alt, size, contentType } from "./opengraph-image";
