const token = '8453e6cde7ad24526f841dcb2b0d17e73766f710';
const auth = Buffer.from(token + ':').toString('base64');
const projectKey = 'code-by-ks_project-losslesscut-rework';

async function parse() {
  const headers = { 'Authorization': 'Basic ' + auth };

  // Vulnerabilities
  const vulnRes = await fetch(`https://sonarcloud.io/api/issues/search?componentKeys=${projectKey}&types=VULNERABILITY`, { headers });
  const vulns = await vulnRes.json();
  console.log('=== VULNERABILITIES (' + vulns.total + ') ===');
  vulns.issues.forEach((v, idx) => {
    const file = v.component.replace(projectKey + ':', '');
    console.log(`${idx + 1}. [${v.severity}] ${file}:${v.line} -> ${v.message} (${v.rule})`);
  });

  // Bugs
  const bugRes = await fetch(`https://sonarcloud.io/api/issues/search?componentKeys=${projectKey}&types=BUG&ps=100`, { headers });
  const bugs = await bugRes.json();
  const ruleCounts = {};
  bugs.issues.forEach(b => {
    ruleCounts[b.rule] = (ruleCounts[b.rule] || 0) + 1;
  });
  console.log('\n=== TOP BUG RULES (Total: ' + bugs.total + ') ===');
  console.log(ruleCounts);

  // Sample Bugs
  console.log('\n=== SAMPLE BUGS ===');
  bugs.issues.slice(0, 10).forEach((b, idx) => {
    const file = b.component.replace(projectKey + ':', '');
    console.log(`${idx + 1}. [${b.severity}] ${file}:${b.line} -> ${b.message} (${b.rule})`);
  });

  // Code Smells
  const smellRes = await fetch(`https://sonarcloud.io/api/issues/search?componentKeys=${projectKey}&types=CODE_SMELL&ps=100`, { headers });
  const smells = await smellRes.json();
  const smellRules = {};
  smells.issues.forEach(s => {
    smellRules[s.rule] = (smellRules[s.rule] || 0) + 1;
  });
  console.log('\n=== TOP CODE SMELL RULES (Total: ' + smells.total + ') ===');
  console.log(smellRules);

  // Sample Code Smells
  console.log('\n=== SAMPLE CODE SMELLS ===');
  smells.issues.slice(0, 10).forEach((s, idx) => {
    const file = s.component.replace(projectKey + ':', '');
    console.log(`${idx + 1}. [${s.severity}] ${file}:${s.line} -> ${s.message} (${s.rule})`);
  });
}

parse().catch(console.error);
