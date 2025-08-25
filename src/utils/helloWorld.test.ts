import { helloWorld, helloWorldWithName } from './helloWorld';

function runTests() {
  console.log('Running hello world tests...\n');

  // Test helloWorld function
  const result1 = helloWorld();
  const expected1 = "Hello, World!";
  console.log(`Test 1: helloWorld()`);
  console.log(`Expected: "${expected1}"`);
  console.log(`Got: "${result1}"`);
  console.log(`Status: ${result1 === expected1 ? '✅ PASS' : '❌ FAIL'}\n`);

  // Test helloWorldWithName function
  const result2 = helloWorldWithName('Alice');
  const expected2 = "Hello, Alice!";
  console.log(`Test 2: helloWorldWithName('Alice')`);
  console.log(`Expected: "${expected2}"`);
  console.log(`Got: "${result2}"`);
  console.log(`Status: ${result2 === expected2 ? '✅ PASS' : '❌ FAIL'}\n`);

  // Test with empty string
  const result3 = helloWorldWithName('');
  const expected3 = "Hello, !";
  console.log(`Test 3: helloWorldWithName('')`);
  console.log(`Expected: "${expected3}"`);
  console.log(`Got: "${result3}"`);
  console.log(`Status: ${result3 === expected3 ? '✅ PASS' : '❌ FAIL'}\n`);

  console.log('Tests completed!');
}

runTests();