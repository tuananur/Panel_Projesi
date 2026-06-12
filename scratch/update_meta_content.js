const fs = require('fs');

const file = 'c:\\Users\\Casper\\Desktop\\TEST\\src\\app\\dashboard\\client\\[id]\\meta\\meta-content.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ background: \'#0064e0\', padding: \'0.5rem 1.2rem\' }}>+ Yeni Oluştur</button>',
  '<button onClick={() => router.push(`/dashboard/client/${id}/meta/create`)} className="btn btn-primary" style={{ background: \'#0064e0\', padding: \'0.5rem 1.2rem\' }}>+ Yeni Oluştur</button>'
);

// We can just leave the modal in the file but unused, or try to remove it.
// To be safe and avoid breaking the JSX tree, let's just replace `showCreateModal` with `false /* showCreateModal */` where it is rendered.
content = content.replace('{showCreateModal && (', '{false && ( /* CREATE MODAL MOVED TO NEW ROUTE */');

fs.writeFileSync(file, content, 'utf8');
console.log('meta-content.jsx updated successfully');
