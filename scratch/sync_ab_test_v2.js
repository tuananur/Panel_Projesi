const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const bilinirlikStartRegex = /\{createFormData\.ab_test && \(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0\.5rem' \}\}>\s*<div style=\{\{ position: 'relative' \}\}>/;
const bilinirlikEndRegex = /<option>İçerik Görüntülemesi Başına Ücret<\/option>\s*<\/optgroup>\s*<\/select>\s*<\/div>\s*<\/div>\s*\)\}/;

const startMatch = content.match(bilinirlikStartRegex);
const endMatch = content.match(bilinirlikEndRegex);

if (!startMatch || !endMatch) {
    console.log("Could not find Bilinirlik start or end");
    process.exit(1);
}

const bilinirlikBlock = content.substring(startMatch.index, endMatch.index + endMatch[0].length);

const trafikStartRegex = /\{createFormData\.ab_test && \(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0\.5rem' \}\}>\s*<div>\s*<div style=\{\{ fontSize: '0\.85rem', fontWeight: 700, color: 'var\(--text-primary\)'/;
const trafikEndRegex = /<option>Tıklama Başına Ücret \(TBM\)<\/option>\s*<\/select>\s*<\/div>\s*<\/div>\s*\)\}/;

const startMatchTrafik = content.match(trafikStartRegex);
const endMatchTrafik = content.match(trafikEndRegex);

if (!startMatchTrafik || !endMatchTrafik) {
    console.log("Could not find Trafik start or end");
    process.exit(1);
}

content = content.substring(0, startMatchTrafik.index) + bilinirlikBlock + content.substring(endMatchTrafik.index + endMatchTrafik[0].length);

fs.writeFileSync(filePath, content);
console.log("Successfully replaced Trafik A/B test block with Bilinirlik A/B test block!");
