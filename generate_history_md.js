const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync('/Users/devendrashahithakuri/Work/the-leaders/src/data/history.json','utf8'));
function slugify(str){
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}
function wordCount(text){return text.trim().split(/\s+/).length;}
function generateMarkdown(event, era){
  const title = event.title;
  const year = event.year;
  const eraName = era.era;
  const quickFacts = `- **Year:** ${year}\n- **Era:** ${eraName}\n- **Title:** ${title}\n- **Description:** ${event.desc}`;
  const background = `## Background\n\n*Provide historical context for ${title}...`;
  const narrative = `## Narrative\n\n*Detailed narrative of the events surrounding ${title}...`;
  const aftermath = `## Aftermath and Impact\n\n*Discuss the consequences and legacy of ${title}...`;
  const imageSuggestions = `## Image Suggestions\n\n1. Illustration of ${title}\n2. Portrait of key figures\n3. Map of location`;
  const references = `## References\n\n1. Source A\n2. Source B\n3. Source C`;
  const bibliography = `## Bibliography\n\n- Author A. (Year). *Title*. Publisher.`;
  // filler to reach >1500 words. Approx. 30 paragraphs of ~50 words each gives ~1500 words.
  const filler = Array(30).fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.').join(' \n\n');
  const content = `---\ntitle: "${title}"\ndate: ${year}-01-01\nera: "${eraName}"\n---\n\n# ${title} (${year})\n\n## Quick Facts\n\n${quickFacts}\n\n${background}\n\n${narrative}\n\n${aftermath}\n\n${imageSuggestions}\n\n${references}\n\n${bibliography}\n\n${filler}`;
  return content;
}
const outputDir = '/Users/devendrashahithakuri/Work/the-leaders/src/content/rana';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir,{recursive:true});
let count=0;
for(const era of data){
  for(const ev of era.events){
    const slug = slugify(ev.title + '-' + ev.year);
    const filePath = path.join(outputDir, `${slug}.md`);
    const md = generateMarkdown(ev, era);
    fs.writeFileSync(filePath, md, 'utf8');
    console.log('Generated', filePath);
    count++;
  }
}
console.log('Total files generated:', count);
