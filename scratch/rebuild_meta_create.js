const fs = require('fs');

const srcLines = fs.readFileSync('src/app/dashboard/client/[id]/meta/meta-content.jsx','utf8').split('\n');
const ctaLabels = srcLines.slice(21, 29).join('\n');
const func1 = srcLines.slice(370, 656).join('\n');
const func2 = srcLines.slice(657, 1215).join('\n');
const func3 = srcLines.slice(1216, 1261).join('\n');

const templateContent = fs.readFileSync('scratch/extract_meta_create.js','utf8');
let template = templateContent.split('const template = `')[1];
template = template.split('`;')[0];

const t2 = template
  .replace('__CTA_LABELS__', ctaLabels)
  .replace('__RENDER_AD_PREVIEW__', func1)
  .replace('__RENDER_AD_FORM_FIELDS__', func2)
  .replace('__RENDER_AUDIENCE_CARD__', func3)
  .replace('const [createFormData', "const [editName, setEditName] = useState('');\n  const [selectedEntity, setSelectedEntity] = useState(null);\n  const [createFormData");

fs.writeFileSync('src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx', t2);
console.log('Rebuilt create-meta-client.jsx completely');
