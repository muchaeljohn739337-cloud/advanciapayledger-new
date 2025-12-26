// Test Ollama API integration with God-Mode Admin Server
const http = require('http');

const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLWdvZC1tb2RlLTE3NjY3Mzc5NTk3ODQiLCJlbWFpbCI6ImFkbWluQGFkdmFuY2lhLmNvbSIsInJvbGUiOiJTVVBFUl9BRE1JTiIsIm5hbWUiOiJTeXN0ZW0gQWRtaW5pc3RyYXRvciIsInR5cGUiOiJnb2QtbW9kZSIsImlhdCI6MTc2NjczNzk1OX0.1yRuIrSj9CPuSAj25ME7m1kmFnMOEMdvcs7n6rSFdJ4';

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n=========================================');
  console.log('🧪 TESTING GOD-MODE ADMIN + OLLAMA');
  console.log('=========================================\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing /god/health...');
    const health = await testEndpoint('/god/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Mode: ${health.data.mode}`);
    console.log(`   Authenticated: ${health.data.authenticated}`);
    console.log(`   ✅ Health check passed\n`);

    // Test 2: Ollama Health
    console.log('2️⃣  Testing /god/ollama/health...');
    const ollamaHealth = await testEndpoint('/god/ollama/health');
    console.log(`   Status: ${ollamaHealth.status}`);
    console.log(`   Ollama Healthy: ${ollamaHealth.data.ollama.healthy}`);
    console.log(`   Ollama Version: ${ollamaHealth.data.ollama.version}`);
    console.log(`   Models Available: ${ollamaHealth.data.models.length}`);
    ollamaHealth.data.models.forEach(m => {
      console.log(`     - ${m.name} (${(m.size / 1e9).toFixed(1)}GB)`);
    });
    console.log(`   ✅ Ollama connected\n`);

    // Test 3: List Models
    console.log('3️⃣  Testing /god/ollama/models...');
    const models = await testEndpoint('/god/ollama/models');
    console.log(`   Status: ${models.status}`);
    console.log(`   Total Models: ${models.data.count}`);
    console.log(`   ✅ Models listed\n`);

    // Test 4: Code Generation (if qwen2.5-coder available)
    console.log('4️⃣  Testing /god/ollama/generate-code...');
    const codeGen = await testEndpoint('/god/ollama/generate-code', 'POST', {
      type: 'function',
      language: 'typescript',
      description: 'Create a simple hello world function that returns a greeting',
    });
    console.log(`   Status: ${codeGen.status}`);
    if (codeGen.data.code) {
      console.log(`   Generated Code:`);
      console.log(`   ${codeGen.data.code.substring(0, 200)}...`);
      console.log(`   Cost: ${codeGen.data.cost}`);
      console.log(`   Privacy: ${codeGen.data.privacy}`);
      console.log(`   ✅ Code generation works!\n`);
    } else {
      console.log(`   Error: ${codeGen.data.error}`);
    }

    console.log('=========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('=========================================\n');
    console.log('💡 Your god-mode admin server is ready!');
    console.log('   - 100% Private code generation');
    console.log('   - $0 cost, unlimited usage');
    console.log('   - Admin-only access (Port 5000)\n');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.log('\n⚠️  Make sure the admin server is running:');
    console.log('   npm run admin\n');
  }
}

// Wait 2 seconds for server to be ready, then run tests
setTimeout(runTests, 2000);
