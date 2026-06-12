const fs = require('fs');

let file1 = 'src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx';
let c = fs.readFileSync(file1, 'utf8');

c = c.replace("height: '100%', minHeight: '80vh'", "minHeight: '100vh', paddingBottom: '2rem'");
c = c.replace("overflow: 'hidden'", "overflow: 'visible'");
c = c.replace("overflowY: 'auto', paddingRight: '0.8rem'", "paddingRight: '0.8rem'"); // remove if exists
// Make the outer form not hidden
c = c.replace("borderRadius: '0 0 8px 8px', overflow: 'hidden'", "borderRadius: '0 0 8px 8px'");

fs.writeFileSync(file1, c, 'utf8');

// Ensure target blank is applied to meta-content.jsx correctly
let file2 = 'src/app/dashboard/client/[id]/meta/meta-content.jsx';
let c2 = fs.readFileSync(file2, 'utf8');
if (!c2.includes("window.open(")) {
    c2 = c2.replace(
        "router.push(`/dashboard/client/${id}/meta/create`)", 
        "window.open(`/dashboard/client/${id}/meta/create`, '_blank')"
    );
    fs.writeFileSync(file2, c2, 'utf8');
}

console.log("Fixed files");
