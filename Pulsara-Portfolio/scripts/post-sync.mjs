#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const siteConfigPath = path.join(__dirname, 'assets', 'site-config.js');
const readmePath = path.join(__dirname, 'README.md');

fs.writeFileSync(
  siteConfigPath,
  `window.SITE = {
  name: "Rajeev Kumar",
  title: "AI Product & Automation Builder",
  email: "rajeevkmba2025@gmail.com",
  linkedin: "https://www.linkedin.com/in/rajeevkumar9/",
  portfolioHome: "../rescale-operator/index.html",
  rescaleOperatorCaseStudy: "../rescale-operator/creative-marketing-agents/index.html",
};
`,
);

const readme = fs.readFileSync(readmePath, 'utf8');
fs.writeFileSync(
  readmePath,
  readme.replace(
    /Built to match the premium style of \[Rajeev Kumar's AI Product & Automation Portfolio\]\([^)]+\)\./,
    "Built to match the premium style of [Rajeev Kumar's AI Product & Automation Portfolio](../rescale-operator/index.html).",
  ),
);

execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
console.log('Post-sync: site-config, README links, and index.html rebuilt for /Pulsara-Portfolio/.');
