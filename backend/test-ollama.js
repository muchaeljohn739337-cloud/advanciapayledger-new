// Quick Ollama Test
const fetch = require('node-fetch');

async function testOllama() {
  console.log('\n🧪 Testing Ollama Integration...\n');
  
  try {
    // Test 1: Ollama Health
    console.log('1️⃣ Checking Ollama API...');
    const healthRes = await fetch('http://localhost:11434/api/version');
    const health = await healthRes.json();
    console.log('✅ Ollama Version:', health.version);
    
    // Test 2: List Models
    console.log('\n2️⃣ Listing Models...');
    const modelsRes = await fetch('http://localhost:11434/api/tags');
    const models = await modelsRes.json();
    console.log('✅ Installed Models:');
    models.models.forEach(m => console.log(   -  ( GB)));
    
    // Test 3: Simple Generation
    console.log('\n3️⃣ Testing Code Generation with qwen2.5-coder:7b...');
    const genRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        prompt: 'Write a TypeScript function that adds two numbers',
        stream: false
      })
    });
    const gen = await genRes.json();
    console.log('✅ Generation Complete!');
    console.log('\nGenerated Code:');
    console.log(gen.response);
    
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('Ollama is ready for the admin server!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOllama();
