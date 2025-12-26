const axios = require('axios');

async function testDiagramAPI() {
  try {
    console.log('🔍 Testing server connection...');
    
    // Step 1: Login
    console.log('📝 Attempting login...');
    const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@advancia.com',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token (full):', token);
    console.log('Token type:', typeof token);
    console.log('Token length:', token.length);
    
    const authHeader = 'Bearer ' + token;
    console.log('Auth header:', authHeader.substring(0, 30) + '...');

    // Step 2: Generate AI Diagram
    console.log('\n🎨 Generating AI diagram...');
    const diagramResponse = await axios.post(
      'http://localhost:4000/api/ai-diagrams/generate',
      {
        prompt: 'Create a user authentication flowchart with login, 2FA verification, and error handling paths',
        title: 'Authentication System Flow',
        diagramType: 'FLOWCHART'
      },
      {
        headers: { 
          Authorization: authHeader,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Diagram generated successfully!');
    console.log('Diagram ID:', diagramResponse.data.id);
    console.log('Title:', diagramResponse.data.title);
    console.log('Type:', diagramResponse.data.diagramType);
    console.log('Mermaid Code (first 200 chars):', diagramResponse.data.mermaidCode.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.code) console.error('Error Code:', error.code);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      console.error('Request headers:', error.config.headers);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

testDiagramAPI();
