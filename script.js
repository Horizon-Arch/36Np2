const fileInput1 = document.getElementById('file1');
const fileInput2 = document.getElementById('file2');
const filename1 = document.getElementById('filename1');
const filename2 = document.getElementById('filename2');
const lines1 = document.getElementById('lines1');
const lines2 = document.getElementById('lines2');

let content1 = '', content2 = '', diffs = [], changeIndexes = [], currentChange = -1;

fileInput1.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  filename1.textContent = file.name;
  const reader = new FileReader();
  reader.onload = () => {
    content1 = reader.result.replace(/\r\n/g, '\n');
    renderDiffIfReady();
  };
  reader.readAsText(file);
});

fileInput2.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  filename2.textContent = file.name;
  const reader = new FileReader();
  reader.onload = () => {
    content2 = reader.result.replace(/\r\n/g, '\n');
    renderDiffIfReady();
  };
  reader.readAsText(file);
});

function renderDiffIfReady() {
  if (content1 && content2) {
    diffs = Diff.diffLines(content1, content2);
    renderDiff(diffs);
    bindSyncScroll();
  }
}

function createLineRow(num, text, type) {
  const row = document.createElement('div');
  row.className = `line-row diff-line ${type}`;
  const number = document.createElement('div');
  number.className = 'line-number';
  number.textContent = num;
  const content = document.createElement('div');
  content.className = 'line-text';
  content.textContent = text;
  row.appendChild(number);
  row.appendChild(content);
  return row;
}

function renderDiff(diff) {
  lines1.innerHTML = '';
  lines2.innerHTML = '';
  changeIndexes = [];
  let num1 = 1, num2 = 1, index = 0;
  diff.forEach(part => {
    const { added, removed, value } = part;
    const lines = value.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    lines.forEach(line => {
      if (removed) {
        lines1.appendChild(createLineRow(num1++, line, 'removed'));
        lines2.appendChild(createLineRow('', '', 'unchanged'));
        changeIndexes.push(index);
      } else if (added) {
        lines1.appendChild(createLineRow('', '', 'unchanged'));
        lines2.appendChild(createLineRow(num2++, line, 'added'));
        changeIndexes.push(index);
      } else {
        lines1.appendChild(createLineRow(num1++, line, 'unchanged'));
        lines2.appendChild(createLineRow(num2++, line, 'unchanged'));
      }
      index++;
    });
  });
}

function bindSyncScroll() {
  let isSyncing = false;
  function sync(source, target) {
    if (isSyncing) return;
    isSyncing = true;
    target.scrollTop = source.scrollTop;
    requestAnimationFrame(() => isSyncing = false);
  }
  lines1.addEventListener('scroll', () => sync(lines1, lines2));
  lines2.addEventListener('scroll', () => sync(lines2, lines1));
}

function gotoDiff(dir) {
  if (changeIndexes.length === 0) return;
  currentChange += dir;
  if (currentChange < 0) currentChange = 0;
  if (currentChange >= changeIndexes.length) currentChange = changeIndexes.length - 1;

  const index = changeIndexes[currentChange];
  const row1 = lines1.querySelectorAll('.diff-line')[index];
  const row2 = lines2.querySelectorAll('.diff-line')[index];

  if (row1 && row2) {
    const parent1 = lines1;
    const parent2 = lines2;

    const offset1 = row1.offsetTop - parent1.clientHeight / 2 + row1.clientHeight / 2;
    const offset2 = row2.offsetTop - parent2.clientHeight / 2 + row2.clientHeight / 2;

    parent1.scrollTo({ top: offset1, behavior: 'smooth' });
    parent2.scrollTo({ top: offset2, behavior: 'smooth' });
  }
}
