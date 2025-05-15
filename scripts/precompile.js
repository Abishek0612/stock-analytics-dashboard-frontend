const fs = require("fs");
const path = require("path");

const pagesToPrecompile = [
  "app/page.js",
  "app/auth/login/page.js",
  "app/auth/signup/page.js",
  "app/dashboard/page.js",
  "app/settings/page.js",
  "app/profile/page.js",
];

console.log("Precompiling Next.js pages to improve development experience...");

pagesToPrecompile.forEach((pagePath) => {
  const fullPath = path.join(process.cwd(), pagePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8");
    fs.writeFileSync(fullPath, content + " ");
    fs.writeFileSync(fullPath, content);
    console.log(`Touched ${pagePath}`);
  } else {
    console.warn(`Page not found: ${pagePath}`);
  }
});

console.log("Precompilation complete!");
