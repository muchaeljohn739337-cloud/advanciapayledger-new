const fetch = require('node-fetch');

async function test() {
  console.log('\n🧪 Testing Ollama + qwen2.5-coder:7b\n');
  
  const r = await fetch('http://localhost:11434/api/tags');
  const d = await r.json();
  
  console.log('Installed Models:');
  d.models.forEach(m => {
    const gb = (m.size / 1000000000).toFixed(2);
    console.log(`  - ${m.name} (${gb} GB)`);
  });
  
  console.log('\nGenerating TypeScript code...');
  const g = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5-coder:7b',
      prompt: 'Write a TypeScript function called add that takes two numbers and returns their sum',
      stream: false
    })
  });
  
  const gen = await g.json();
  console.log('\n✅ Generated Code:');
  console.log(gen.response);
  console.log('\n✅ Ollama + qwen2.5-coder:7b is WORKING!\n');
}

test().catch(e => console.error('Error:', e));
