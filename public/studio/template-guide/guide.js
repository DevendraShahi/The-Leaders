(() => {
  'use strict';
  const examples = window.STUDIO_GUIDE_DATA.examples;
  const byId = new Map(examples.map(example => [example.id, example]));
  const get = id => document.getElementById(id);
  const create = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
  let active;
  const valueText = value => value === '' ? '"" — leave empty when unknown' : value === null ? 'null — unknown, not zero' : Array.isArray(value) ? value.length ? value.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n') : '[] — no supplied URLs / rows' : String(value);
  function highlight(name) {
    const box = get('highlight'), regions = active.regions || [];
    const region = regions.find(item => item.name === name);
    get('sections').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.section === name)));
    if (!region) { box.style.display = 'none'; return; }
    Object.assign(box.style, { display: 'block', left: `${region.x * 100}%`, top: `${region.y * 100}%`, width: `${region.w * 100}%`, height: `${region.h * 100}%` });
    box.dataset.label = name.replaceAll('-', ' ').toUpperCase();
  }
  function nav() {
    const term = get('search').value.toLowerCase().trim(), holder = get('templates'); holder.replaceChildren();
    const groups = new Map();
    examples.forEach((example, index) => { if (term && !`${example.title} ${example.group} ${example.purpose}`.toLowerCase().includes(term)) return; if (!groups.has(example.group)) groups.set(example.group, []); groups.get(example.group).push([example, index]); });
    for (const [group, entries] of groups) {
      const section = create('section', 'nav-group'); section.append(create('h3', '', group));
      entries.forEach(([example, index]) => { const button = create('button', 'nav-item', example.title); button.dataset.id = example.id; button.setAttribute('aria-current', String(active?.id === example.id)); button.append(create('span', '', String(index + 1).padStart(2, '0'))); button.onclick = () => { location.hash = example.id; }; section.append(button); });
      holder.append(section);
    }
    if (!groups.size) holder.append(create('p', '', 'No matching templates.'));
  }
  function show() {
    active = byId.get(location.hash.slice(1)) || examples[0];
    get('title').textContent = active.title; get('group').textContent = active.group.toUpperCase(); get('purpose').textContent = active.purpose;
    get('position').textContent = `${String(examples.indexOf(active) + 1).padStart(2, '0')} / ${examples.length}`;
    get('preview').src = `previews/${active.id}.jpg`; get('preview').alt = `Illustrative Studio example: ${active.title}. Fictional figures for training only.`;
    get('download').href = `samples/${active.id}.json`;
    get('json').textContent = JSON.stringify(active.response, null, 2); get('copy-status').textContent = '';
    get('highlight').style.display = 'none';
    const sections = get('sections'); sections.replaceChildren();
    const names = [...new Set((active.regions || []).filter(region => region.w > 0 && region.h > 0).map(region => region.name))];
    names.forEach(name => { const button = create('button', '', name.replaceAll('-', ' ')); button.dataset.section = name; button.setAttribute('aria-pressed', 'false'); button.onclick = () => highlight(name); sections.append(button); });
    const fields = get('fields'); fields.replaceChildren(); const groups = new Map();
    active.fields.forEach(field => { if (!groups.has(field.section)) groups.set(field.section, []); groups.get(field.section).push(field); });
    for (const [name, rows] of [...groups].sort((a, b) => Number(a[0].includes('Setup')) - Number(b[0].includes('Setup')))) {
      const metadata = name.includes('Setup'); const section = create(metadata ? 'details' : 'section', 'field-group'); section.append(create(metadata ? 'summary' : 'h4', '', metadata ? 'Setup & evidence · not printed' : name));
      rows.forEach(field => { const row = create('div', 'field'); row.append(create('div', 'field-name', field.label), create('code', '', field.path), create('div', 'field-value', valueText(field.value)), create('p', 'field-help', field.help)); section.append(row); }); fields.append(section);
    }
    const notes = get('notes'); notes.replaceChildren(); active.notes.forEach(note => notes.append(create('li', '', note)));
    nav();
    window.scrollTo(0, 0);
  }
  get('search').addEventListener('input', nav);
  get('print').onclick = () => window.print();
  get('copy').onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(active.response, null, 2)); get('copy-status').textContent = 'Training JSON copied. Replace sample facts before publishing.'; } catch { const selection = window.getSelection(), range = document.createRange(); range.selectNodeContents(get('json')); selection.removeAllRanges(); selection.addRange(range); get('copy-status').textContent = 'JSON selected. Copy it manually with Ctrl+C or Command+C.'; } };
  window.addEventListener('hashchange', show); show();
})();
