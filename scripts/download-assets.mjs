import { mkdir, writeFile } from "node:fs/promises";

const assets = {
  "phone-hush-1.png": "https://framerusercontent.com/images/1cKLfQGNDOYoIcTRXGemHPNgc.png?width=786&height=1708",
  "phone-hush-2.png": "https://framerusercontent.com/images/3gcQDf5gJ4KdzKBqZFRcWimeRI.png?width=794&height=1716",
  "phone-hush-3.png": "https://framerusercontent.com/images/9PCSLeQkOEdFNUXFZk2FjOmseAk.png?width=786&height=1702",
  "phone-indus-1.png": "https://framerusercontent.com/images/aW4kGlS3M2DVFQi7M8t7Ldutzx0.png?width=786&height=1704",
  "phone-indus-2.png": "https://framerusercontent.com/images/C5ZMZk83XpBa6V0sz7DZWnubM.png?width=786&height=1704",
  "phone-indus-3.png": "https://framerusercontent.com/images/F1su1JgSsRHc7ODPgGxM7cr660.png?width=786&height=1700",
  "phone-founder-1.png": "https://framerusercontent.com/images/h0K8DocCZVmFE5uGCJV0L0ZE.png?width=786&height=1704",
  "phone-founder-2.png": "https://framerusercontent.com/images/hAAzjrDUTHZkd3XnqlkVvN40IBE.png?width=786&height=1704",
  "phone-founder-3.png": "https://framerusercontent.com/images/kl6AfTsdnOWX7oR5KHeOFdRUg.png?width=786&height=1704",
  "showcase-1.png": "https://framerusercontent.com/images/7JhnJ8ZyGhPrA2N7kh9Dq2sfoA.png?scale-down-to=1024&width=4096&height=3407",
  "showcase-2.png": "https://framerusercontent.com/images/7mRaUBfo9PFWKlvYQajX9u2f8SQ.png?scale-down-to=1024&width=4096&height=3105",
  "portrait.png": "https://framerusercontent.com/images/DQzrz0uPjSpzBuMdLXdltc7fIY.jpg?width=400&height=400"
};

await mkdir(new URL("../public/assets/", import.meta.url), { recursive: true });
for (const [name, url] of Object.entries(assets)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  await writeFile(new URL(`../public/assets/${name}`, import.meta.url), Buffer.from(await response.arrayBuffer()));
  console.log(name);
}
