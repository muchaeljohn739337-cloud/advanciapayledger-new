// Test Cohere Integration
const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api/cohere';

async function testCohere() {
  console.log('🚀 Testing Cohere Integration...\n');

  try {
    // 1. Health Check
    console.log('1. Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', health.data);
    console.log('');

    // 2. Transaction Classification
    console.log('2. Testing Transaction Classification...');
    const classification = await axios.post(`${BASE_URL}/classify-transaction`, {
      amount: 125.50,
      description: 'Starbucks Coffee Downtown',
      merchant: 'Starbucks',
      location: 'New York, NY'
    });
    console.log('✅ Classification:', classification.data);
    console.log('');

    // 3. Fraud Detection
    console.log('3. Testing Fraud Detection...');
    const fraudCheck = await axios.post(`${BASE_URL}/detect-fraud`, {
      userId: 'user123',
      amount: 2500,
      description: 'Wire Transfer',
      merchant: 'Unknown',
      location: 'Nigeria',
      timestamp: new Date(),
      userHistory: {
        averageTransaction: 50,
        totalTransactions: 100
      }
    });
    console.log('✅ Fraud Analysis:', fraudCheck.data);
    console.log('');

    // 4. Customer Support Chat
    console.log('4. Testing Support Chatbot...');
    const chat = await axios.post(`${BASE_URL}/chat`, {
      message: 'How do I check my account balance?',
      userContext: {
        userId: 'user123',
        accountBalance: 1500.50
      }
    });
    console.log('✅ Chat Response:', chat.data);
    console.log('');

    // 5. Semantic Search
    console.log('5. Testing Semantic Search...');
    const search = await axios.post(`${BASE_URL}/search`, {
      query: 'refund policy',
      documents: [
        'Our refund policy allows returns within 30 days',
        'How to reset your password',
        'Contact customer support for refunds',
        'Shipping and delivery information'
      ],
      topK: 2
    });
    console.log('✅ Search Results:', search.data);
    console.log('');

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCohere();
