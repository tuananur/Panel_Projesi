const fs = require('fs');
const path = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let content = fs.readFileSync(path, 'utf8');

const badChunk = \`            {activeTab === 'adsets' && renderAdsetFormFields(createFormData, setCreateFormData, true, true)}
            {activeTab === 'ads' && renderAdFormFields(createFormData, setCreateFormData, true, true)}
          </div>


              </>
            )}\`;

const goodChunk = \`            {activeTab === 'adsets' && renderAdsetFormFields(createFormData, setCreateFormData, true, true)}
            {activeTab === 'ads' && renderAdFormFields(createFormData, setCreateFormData, true, true)}
              </>
            )}
          </div>\`;

if (content.includes(badChunk)) {
  content = content.replace(badChunk, goodChunk);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Syntax error fixed.");
} else {
  console.log("Could not find bad chunk.");
}
