const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'client', '[id]', 'stats', 'stats-content.jsx');

console.log('Reading file:', filePath);
let code = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF
code = code.replace(/\r\n/g, '\n');

// Since the file has already been partially refactored in the previous step,
// let's restore it from a backup or revert it. But wait, we can just do a git checkout or git revert!
// Let's run `git checkout src/app/dashboard/client/[id]/stats/stats-content.jsx` first so we have a clean copy to run our updated refactor_slides.js on!
// Yes, we will execute git checkout using run_command first before running the node script.
// Wait, we can also do that in the script or run it directly. Let's make the script robust.

// Let's first parse out the slides array code
const renderSlidesIndex = code.indexOf('const renderSlides = (activeIndex, showAll) => {');
if (renderSlidesIndex === -1) {
  console.error('Could not find const renderSlides definition!');
  process.exit(1);
}

console.log('Found renderSlides at index:', renderSlidesIndex);

// Let's slice the code to get the renderSlides content and the slides array
let renderSlidesCode = code.slice(renderSlidesIndex);

// Now let's extract the slides array elements between `const slides = [` and the end of Slide 11
const kapakIndex = renderSlidesCode.indexOf('/* SLAYT 1: KAPAK SAYFASI */');
if (kapakIndex === -1) {
  console.error('Could not find SLAYT 1!');
  process.exit(1);
}

// Find the end of slide 11
const lastSlideEndText = `<div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '12px', background: '#0085FF' }}></div>\n        </div>`;
const lastSlideEndIndex = renderSlidesCode.lastIndexOf(lastSlideEndText);

if (lastSlideEndIndex === -1) {
  console.error('Could not find last slide end pattern!');
  process.exit(1);
}

const lastSlideFullEndIndex = lastSlideEndIndex + lastSlideEndText.length;

// Extract the raw sequential slide JSX code block
let slidesBody = renderSlidesCode.substring(kapakIndex, lastSlideFullEndIndex);

// Now let's format slidesBody to have commas between slides!
slidesBody = slidesBody.replace(/<\/div>(\s+\{\/\* SLAYT \d+:)/g, '</div>,$1');

// Now let's convert any JSX comments `{/* SLAYT ... */}` to regular JS comments `/* SLAYT ... */`!
// This is critical because `slides` is a JS array, not JSX!
slidesBody = slidesBody.replace(/\{\/\*(SLAYT \d+:[^*]*)\*\/\}/g, '/*$1*/');

console.log('Successfully formatted slides body with commas and regular JS comments!');

// Now let's build the full clean `renderSlides` helper definition:
const finalRenderSlides = `  const renderSlides = (activeIndex, showAll) => {
    const slides = [
${slidesBody}
    ];

    if (showAll) {
      return (
        <>
          {slides}
        </>
      );
    }
    return slides[activeIndex] || null;
  };
`;

// Let's delete the old renderSlides from `code` (which went from renderSlidesIndex to the end of the file)
let cleanCode = code.slice(0, renderSlidesIndex);

// Let's find where to insert renderSlides!
const insertPointSearch = `  const TaskList = ({ tasks, title, icon: Icon, color }) => (\n    <div className="card premium-task-list"`;
const taskListIndex = cleanCode.indexOf(insertPointSearch);
if (taskListIndex === -1) {
  console.error('Could not find TaskList definition insertion point!');
  process.exit(1);
}

// Let's find the closing `  );\n\n  return (` after taskListIndex
const returnIndex = cleanCode.indexOf('  return (', taskListIndex);
if (returnIndex === -1) {
  console.error('Could not find return statement insertion point!');
  process.exit(1);
}

console.log('Inserting renderSlides at returnIndex:', returnIndex);

// Insert renderSlides!
cleanCode = cleanCode.slice(0, returnIndex) + finalRenderSlides + '\n' + cleanCode.slice(returnIndex);

// Let's replace the old Performance Overview Card (lines 1121-1342) with our new SlideViewer Card!
const oldCardSearchStart = `<div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '450px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>`;
const oldCardStartIndex = cleanCode.indexOf(oldCardSearchStart);
if (oldCardStartIndex === -1) {
  console.error('Could not find old performance card start!');
  process.exit(1);
}

// Old card ends after `PDF Performans Raporu Oluştur` button:
const oldCardSearchEnd = `          </button>\n        </div>`;
const oldCardEndOffset = cleanCode.indexOf(oldCardSearchEnd, oldCardStartIndex);
if (oldCardEndOffset === -1) {
  console.error('Could not find old performance card end!');
  process.exit(1);
}
const oldCardEndIndex = oldCardEndOffset + oldCardSearchEnd.length;

// Let's design the slide viewer replacement:
const slideViewerReplacement = `        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '550px', padding: '1.5rem', position: 'relative', overflow: 'hidden', gap: '1rem' }}>
          {/* Decorative Background Element */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-primary)', opacity: 0.03, borderRadius: '50%', zIndex: 0 }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '0.5rem', zIndex: 1 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)' }}>
              {currentMonthName} Ayı Dijital Performans Raporu
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                style={{
                  background: 'linear-gradient(135deg, #0085FF 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 10px rgba(0, 133, 255, 0.25)',
                  transition: 'all 0.2s',
                  opacity: isGeneratingPDF ? 0.7 : 1
                }}
                className="hover-glow"
              >
                {isGeneratingPDF ? <Clock size={14} className="animate-spin" /> : <BookOpen size={14} />}
                {isGeneratingPDF ? 'PDF Hazırlanıyor...' : 'Tüm Raporu PDF İndir'}
              </button>
            </div>
          </div>

          {/* Quick-Jump Slides Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '0.4rem', 
            overflowX: 'auto', 
            paddingBottom: '0.5rem', 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            borderBottom: '1px solid var(--border-color)',
            zIndex: 1
          }}>
            {[
              'Kapak', 'Kullanıcı 1', 'Kullanıcı 2', 'Arama/SEO', 'Lokasyon', 
              'Kanallar', 'Görünürlük', 'Sorgular', 'Blog', 'Cihazlar', 'Tarayıcılar'
            ].map((slideTitle, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                style={{
                  flexShrink: 0,
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  transition: 'all 0.2s',
                  backgroundColor: activeSlide === index ? 'rgba(0, 133, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: activeSlide === index ? '#0085FF' : 'var(--border-color)',
                  color: activeSlide === index ? '#0085FF' : 'var(--text-secondary)'
                }}
              >
                {slideTitle}
              </button>
            ))}
          </div>

          {/* Slide Viewer Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', flex: 1, zIndex: 1, marginTop: '0.5rem' }}>
            {/* Left Button */}
            <button
              onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
              disabled={activeSlide === 0}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                cursor: activeSlide === 0 ? 'not-allowed' : 'pointer',
                opacity: activeSlide === 0 ? 0.3 : 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              className="hover-glow"
            >
              &lt;
            </button>

            {/* Slide Scaling Container */}
            <div style={{ flex: 1, width: '100%' }}>
              <SlideWrapper>
                {renderSlides(activeSlide, false)}
              </SlideWrapper>
            </div>

            {/* Right Button */}
            <button
              onClick={() => setActiveSlide(prev => Math.min(10, prev + 1))}
              disabled={activeSlide === 10}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                cursor: activeSlide === 10 ? 'not-allowed' : 'pointer',
                opacity: activeSlide === 10 ? 0.3 : 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              className="hover-glow"
            >
              &gt;
            </button>
          </div>

          {/* Navigation Dots and Details */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', zIndex: 1 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Slayt {activeSlide + 1} / 11
            </span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {Array.from({ length: 11 }).map((_, index) => (
                <div
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    background: activeSlide === index ? '#0085FF' : 'var(--border-color)',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>`;

// Replace old card
cleanCode = cleanCode.slice(0, oldCardStartIndex) + slideViewerReplacement + cleanCode.slice(oldCardEndIndex);

// Append closing tags and the hidden report template directly!
cleanCode = cleanCode + `\n      <div id="report-template" style={{ display: 'none' }}>\n        {renderSlides(null, true)}\n      </div>\n    </>\n  );\n}\n`;

// Write back in UTF-8
fs.writeFileSync(filePath, cleanCode, 'utf8');
console.log('Successfully refactored stats-content.jsx with standard JS comments!');
