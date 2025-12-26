/**
 * TEST GOD-MODE SERVER
 * Quick verification script
 */

const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLWRlZmF1bHQtaWQiLCJlbWFpbCI6ImFkbWluQGFkdmFuY2lhLmNvbSIsInJvbGUiOiJBRE1JTiIsIm5hbWUiOiJTeXN0ZW0gQWRtaW5pc3RyYXRvciIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjU5NDMyMzksImV4cCI6MTc2ODUzNTIzOX0.MAuSOS1aMsSzjVekvcg6JbNFGRnHgt3LQ2DCE1ftcck';
const ADMIN_PORT = 5000;

async function testEndpoint(name, method, path, token, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`http://localhost:${ADMIN_PORT}${path}`, options);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${name}: SUCCESS`);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ ${name}: FAILED (${response.status})`);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR`);
    console.error(error.message);
  }
  console.log('');
}

async function runTests() {
  console.log('');
  console.log('============================================');
  console.log('🧪 TESTING GOD-MODE SERVER');
  console.log('============================================');
  console.log('');
  console.log('Token:', ADMIN_TOKEN.substring(0, 50) + '...');
  console.log('');
  console.log('============================================');
  console.log('');

  // Test 1: Who Am I
  await testEndpoint('WHO AM I', 'GET', '/god/whoami', ADMIN_TOKEN);

  // Test 2: Health Check
  await testEndpoint('HEALTH CHECK', 'GET', '/god/health', ADMIN_TOKEN);

  // Test 3: System Status
  await testEndpoint('SYSTEM STATUS', 'GET', '/god/system/status', ADMIN_TOKEN);

  // Test 4: AI Health
  await testEndpoint('AI HEALTH', 'GET', '/god/ai/health', ADMIN_TOKEN);

  // Test 5: AI Task Execution (Classification)
  await testEndpoint(
    'AI CLASSIFICATION',
    'POST',
    '/god/ai/execute',
    ADMIN_TOKEN,
    {
      task: 'classification',
      data: {
        amount: 150.50,
        description: 'Starbucks Coffee',
        merchant: 'Starbucks',
        location: 'Seattle, WA',
      },
    }
  );

  console.log('============================================');
  console.log('🎯 TEST COMPLETE');
  console.log('============================================');
}

runTests().catch(console.error);
