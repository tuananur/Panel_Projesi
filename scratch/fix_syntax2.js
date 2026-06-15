const fs = require('fs');
const path = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldStr = "} && renderAdFormFields(createFormData, setCreateFormData, true, true)}\n          </div>\n\n\n              </>\n            )}";
const newStr = "} && renderAdFormFields(createFormData, setCreateFormData, true, true)}\n              </>\n            )}\n          </div>";

const idx = content.indexOf("renderAdFormFields(createFormData, setCreateFormData, true, true)}");
if (idx !== -1) {
    const endStr = content.slice(idx, idx + 150);
    // Let's replace manually
    const lines = content.split('\n');
    let adsIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("renderAdFormFields(createFormData, setCreateFormData, true, true)}")) {
            adsIdx = i;
            break;
        }
    }
    if (adsIdx !== -1) {
        lines[adsIdx + 1] = "              </>";
        lines[adsIdx + 2] = "            )}";
        lines[adsIdx + 3] = "          </div>";
        lines[adsIdx + 4] = "";
        lines[adsIdx + 5] = "";
        
        fs.writeFileSync(path, lines.join('\n'), 'utf8');
        console.log("Fixed by lines.");
    }
}
