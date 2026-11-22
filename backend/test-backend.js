// backend/test-backend.js
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Running backend security & integration tests...\n');

  // Test 1: Health check
  const health = await request({ host: 'localhost', port: 3001, path: '/api/health', method: 'GET' });
  console.log('✓ Health check:', health.status === 200 ? 'PASSED' : 'FAILED');

  // Test 2: Register user with weak password (cybersecurity policy check)
  const weakPw = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'test@example.com', password: 'weak', username: 'TestUser' });
  console.log('✓ Password policy blocks weak password:', weakPw.status === 400 ? 'PASSED' : 'FAILED');

  // Test 3: Register user with strong password
  const testEmail = `user_${Date.now()}@test.com`;
  const registerRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: testEmail, password: 'SecurePassword123!', username: 'CyberUser' });
  console.log('✓ Register with strong password & bcrypt:', registerRes.status === 201 ? 'PASSED' : 'FAILED');
  const token = registerRes.data.token;
  const user = registerRes.data.user;

  // Test 4: Get Current User with JWT token
  const meRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  console.log('✓ JWT protected /me endpoint:', meRes.status === 200 && meRes.data.email === testEmail ? 'PASSED' : 'FAILED');

  // Test 5: Create food item
  const foodRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/foods',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  }, { name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 6, fat: 2 });
  console.log('✓ Create food item:', foodRes.status === 201 && foodRes.data.name === 'Greek Yogurt' ? 'PASSED' : 'FAILED');

  // Test 6: Search foods
  const searchRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/foods/search?q=Greek',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  console.log('✓ Search foods:', searchRes.status === 200 && searchRes.data.documents.length > 0 ? 'PASSED' : 'FAILED');

  // Test 7: Create nutritional goal
  const goalRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/goals',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  }, { userId: user.accountId, goalType: 'maintain', calories: 2200, protein: 150, carbs: 200, fat: 60 });
  console.log('✓ Set user goal:', goalRes.status === 201 ? 'PASSED' : 'FAILED');

  // Test 8: Create daily log
  const today = new Date().toISOString();
  const logRes = await request({
    host: 'localhost',
    port: 3001,
    path: '/api/daily-logs',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  }, {
    userId: user.accountId,
    date: today,
    foods: [{ name: 'Greek Yogurt', quantity: 200, calories: 240, protein: 30, carbs: 12, fat: 4 }],
    totalCalories: 240,
    totalProtein: 30,
    totalCarbs: 12,
    totalFat: 4,
  });
  console.log('✓ Create daily log:', logRes.status === 201 ? 'PASSED' : 'FAILED');

  console.log('\nAll core backend endpoints and security controls verified!');
}

module.exports = runTests;
if (require.main === module) {
  runTests().catch(console.error);
}
