const fs = require('fs');
const path = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove the injected selectedObjective === 'Trafik' check and the extra fragment
code = code.replace(
  `            {selectedObjective === 'Trafik' && trafficSetupType === 'custom' ? (
               renderTailoredTrafficFormFields(createFormData, setCreateFormData)
            ) : (
              <>
            {activeTab === 'campaigns' && (`,
  `            { (activeTab === 'campaigns' || (selectedObjective === 'Trafik' && trafficSetupType === 'custom')) && (`
);

code = code.replace(
  `            {activeTab === 'adsets' && renderAdsetFormFields(createFormData, setCreateFormData, true, true)}
            {activeTab === 'ads' && renderAdFormFields(createFormData, setCreateFormData, true, true)}
              </>
            )}`,
  `            {(activeTab === 'adsets' || (selectedObjective === 'Trafik' && trafficSetupType === 'custom')) && renderAdsetFormFields(createFormData, setCreateFormData, true, true)}
            {(activeTab === 'ads' || (selectedObjective === 'Trafik' && trafficSetupType === 'custom')) && renderAdFormFields(createFormData, setCreateFormData, true, true)}`
);

// 2. Hide the tabs when trafficSetupType === 'custom'
const tabsStart = `<div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>`;
const tabsReplacement = `{!(selectedObjective === 'Trafik' && trafficSetupType === 'custom') && (
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>`;

code = code.replace(tabsStart, tabsReplacement);

// We need to find the end of the tabs div to close the conditional.
// The tabs div ends right before `</div>` and `<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>`
const tabsEnd = `            <div onClick={() => setActiveTab('ads')} style={{ flex: 1, padding: '1rem', textAlign: 'center', cursor: 'pointer', fontWeight: 600, color: activeTab === 'ads' ? '#1877f2' : 'var(--text-secondary)', borderBottom: activeTab === 'ads' ? '3px solid #1877f2' : '3px solid transparent', background: activeTab === 'ads' ? 'rgba(24,119,242,0.05)' : 'transparent', transition: 'all 0.2s' }}>
              Reklam
            </div>
          </div>`;
          
const tabsEndReplacement = `            <div onClick={() => setActiveTab('ads')} style={{ flex: 1, padding: '1rem', textAlign: 'center', cursor: 'pointer', fontWeight: 600, color: activeTab === 'ads' ? '#1877f2' : 'var(--text-secondary)', borderBottom: activeTab === 'ads' ? '3px solid #1877f2' : '3px solid transparent', background: activeTab === 'ads' ? 'rgba(24,119,242,0.05)' : 'transparent', transition: 'all 0.2s' }}>
              Reklam
            </div>
          </div>
          )}`;

code = code.replace(tabsEnd, tabsEndReplacement);

fs.writeFileSync(path, code, 'utf8');
console.log('Done!');
