const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/client/[id]/meta/create/create-meta-client.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// Find the Bilinirlik A/B Test block
const bilinirlikAbStart = content.indexOf(`{createFormData.ab_test && (\n                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>\n                          <div style={{ position: 'relative' }}>`);

if (bilinirlikAbStart === -1) {
    console.error("Could not find Bilinirlik A/B test start");
    process.exit(1);
}

// Find the end of the Bilinirlik A/B Test block
// It ends with:
/*
                                <option>İçerik Görüntülemesi Başına Ücret</option>
                              </optgroup>
                            </select>
                          </div>
                        </div>
                      )}
*/
const bilinirlikAbEndSearchStr = `                                <option>İçerik Görüntülemesi Başına Ücret</option>\n                              </optgroup>\n                            </select>\n                          </div>\n                        </div>\n                      )}`;
const bilinirlikAbEnd = content.indexOf(bilinirlikAbEndSearchStr, bilinirlikAbStart) + bilinirlikAbEndSearchStr.length;

if (bilinirlikAbEnd <= bilinirlikAbStart + bilinirlikAbEndSearchStr.length) {
    console.error("Could not find Bilinirlik A/B test end");
    process.exit(1);
}

const bilinirlikAbBlock = content.substring(bilinirlikAbStart, bilinirlikAbEnd);

// Find the Trafik A/B Test block
const trafikAbStart = content.indexOf(`{createFormData.ab_test && (\n                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>\n                          <div>\n                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)'`);

if (trafikAbStart === -1) {
    console.error("Could not find Trafik A/B test start");
    process.exit(1);
}

// It ends with:
/*
                              <option>Tıklama Başına Ücret (TBM)</option>
                            </select>
                          </div>
                        </div>
                      )}
*/
const trafikAbEndSearchStr = `                              <option>Tıklama Başına Ücret (TBM)</option>\n                            </select>\n                          </div>\n                        </div>\n                      )}`;
const trafikAbEnd = content.indexOf(trafikAbEndSearchStr, trafikAbStart) + trafikAbEndSearchStr.length;

if (trafikAbEnd <= trafikAbStart + trafikAbEndSearchStr.length) {
    console.error("Could not find Trafik A/B test end");
    process.exit(1);
}

// Replace it!
const newContent = content.substring(0, trafikAbStart) + bilinirlikAbBlock + content.substring(trafikAbEnd);

fs.writeFileSync(filePath, newContent);
console.log("Successfully replaced Trafik A/B test block with Bilinirlik A/B test block!");
