const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/Problem');

dotenv.config({ path: './backend/.env' });

const problems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
    roadmapDay: 1,
    hints: { tier1: 'Try using a hash map to store values you have seen.', tier2: 'For each number, check if target minus that number exists in your map.', tier3: 'Store each number as a key and its index as the value as you iterate.' },
    acceptanceRate: 49,
  },
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    description: 'Write a function that reverses a string. The input string is given as an array of characters.',
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: 'Reverse the array in-place.' }
    ],
    constraints: ['1 <= s.length <= 10^5', 's[i] is a printable ASCII character.'],
    roadmapDay: 2,
    hints: { tier1: 'Try using two pointers, one at each end.', tier2: 'Swap characters at both pointers and move them toward the center.', tier3: 'Continue until the two pointers meet in the middle.' },
    acceptanceRate: 76,
  },
  {
    title: 'FizzBuzz',
    slug: 'fizzbuzz',
    difficulty: 'Easy',
    tags: ['Math', 'String'],
    description: 'Given an integer n, return a string array where answer[i] is "FizzBuzz" if i is divisible by both 3 and 5, "Fizz" if divisible by 3, "Buzz" if divisible by 5, or the number itself otherwise.',
    examples: [
      { input: 'n = 15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', explanation: '' }
    ],
    constraints: ['1 <= n <= 10^4'],
    roadmapDay: 3,
    hints: { tier1: 'Use the modulo operator % to check divisibility.', tier2: 'Check for FizzBuzz condition first before Fizz and Buzz separately.', tier3: 'Build the result string conditionally for each number from 1 to n.' },
    acceptanceRate: 68,
  },
  {
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    description: 'A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: 'After cleaning: "amanaplanacanalpanama" is a palindrome.' }
    ],
    constraints: ['1 <= s.length <= 2 * 10^5'],
    roadmapDay: 4,
    hints: { tier1: 'Clean the string first by keeping only alphanumeric characters.', tier2: 'Convert to lowercase before comparing.', tier3: 'Use two pointers from both ends moving inward to compare characters.' },
    acceptanceRate: 45,
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    description: 'Given an integer array nums, find the subarray with the largest sum and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    roadmapDay: 5,
    hints: { tier1: "Think about what happens when you extend a subarray vs starting fresh.", tier2: "Keep track of the current sum and reset it to 0 if it goes negative.", tier3: "Kadane's algorithm: currentSum = max(num, currentSum + num) at each step." },
    acceptanceRate: 50,
  },
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    tags: ['Dynamic Programming', 'Math'],
    description: 'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' }
    ],
    constraints: ['1 <= n <= 45'],
    roadmapDay: 6,
    hints: { tier1: 'Think about how many ways you can reach step n from step n-1 and n-2.', tier2: 'The answer for n depends on the answers for n-1 and n-2.', tier3: 'This follows the Fibonacci pattern: ways(n) = ways(n-1) + ways(n-2).' },
    acceptanceRate: 52,
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    description: 'Given an array prices where prices[i] is the price of a stock on day i, return the maximum profit you can achieve. If no profit is possible, return 0.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price=1) and sell on day 5 (price=6), profit = 5.' }
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    roadmapDay: 7,
    hints: { tier1: 'Track the minimum price seen so far as you iterate.', tier2: 'At each day, calculate profit if you sold today minus the minimum price so far.', tier3: 'Keep updating the maximum profit and minimum price in a single pass.' },
    acceptanceRate: 54,
  },
  {
    title: 'Linked List Cycle',
    slug: 'linked-list-cycle',
    difficulty: 'Easy',
    tags: ['Linked List', 'Two Pointers'],
    description: 'Given head of a linked list, determine if the linked list has a cycle in it.',
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'There is a cycle, tail connects to node index 1.' }
    ],
    constraints: ['0 <= number of nodes <= 10^4'],
    roadmapDay: 8,
    hints: { tier1: 'Use two pointers moving at different speeds.', tier2: 'A slow pointer moves 1 step, a fast pointer moves 2 steps.', tier3: 'If there is a cycle, the fast pointer will eventually catch up to the slow pointer.' },
    acceptanceRate: 46,
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    examples: [
      { input: 's = "()[]{}"', output: 'true', explanation: 'All brackets are closed in the correct order.' }
    ],
    constraints: ['1 <= s.length <= 10^4'],
    roadmapDay: 9,
    hints: { tier1: 'Use a stack data structure to track opening brackets.', tier2: 'When you see a closing bracket, check if it matches the top of the stack.', tier3: 'At the end, the stack should be empty if all brackets are matched.' },
    acceptanceRate: 40,
  },
  {
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    description: 'Given a sorted array of integers nums and an integer target, return the index of target. If not found, return -1.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' }
    ],
    constraints: ['1 <= nums.length <= 10^4', 'All values are unique.', 'nums is sorted in ascending order.'],
    roadmapDay: 10,
    hints: { tier1: 'Use two pointers: left and right, representing the search boundary.', tier2: 'Calculate mid = Math.floor((left + right) / 2) and compare nums[mid] to target.', tier3: 'If nums[mid] < target, move left to mid+1. If greater, move right to mid-1.' },
    acceptanceRate: 55,
  },
  {
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    description: 'Merge two sorted linked lists and return the head of the merged list.',
    examples: [
      { input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Merge by comparing heads and linking smaller one first.' }
    ],
    constraints: ['0 <= number of nodes <= 50', '-100 <= Node.val <= 100'],
    roadmapDay: 11,
    hints: { tier1: 'Compare the heads of both lists and pick the smaller one.', tier2: 'Recursively merge the rest of the lists.', tier3: 'Base case: if either list is null, return the other list.' },
    acceptanceRate: 62,
  },
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'Medium',
    tags: ['Graph', 'BFS', 'DFS'],
    description: 'Given a 2D grid of "1"s (land) and "0"s (water), count the number of islands.',
    examples: [
      { input: 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]', output: '2', explanation: 'Two separate groups of connected land cells.' }
    ],
    constraints: ['1 <= grid dimensions <= 300'],
    roadmapDay: 12,
    hints: { tier1: 'Use DFS or BFS to explore connected land cells.', tier2: 'When you find a "1", increment count and mark all connected "1"s as visited.', tier3: 'Replace visited "1"s with "0"s to avoid revisiting them.' },
    acceptanceRate: 57,
  },
  {
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'Medium',
    tags: ['Dynamic Programming', 'BFS'],
    description: 'Given coins of different denominations and a total amount, return the fewest number of coins needed to make up that amount. Return -1 if impossible.',
    examples: [
      { input: 'coins = [1,5,10], amount = 11', output: '2', explanation: '10 + 1 = 11, using 2 coins.' }
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= amount <= 10^4'],
    roadmapDay: 13,
    hints: { tier1: 'Build up solutions for smaller amounts first.', tier2: 'dp[i] = minimum coins needed to make amount i.', tier3: 'For each amount, try every coin: dp[i] = min(dp[i], dp[i - coin] + 1).' },
    acceptanceRate: 42,
  },
  {
    title: 'Longest Common Prefix',
    slug: 'longest-common-prefix',
    difficulty: 'Easy',
    tags: ['String'],
    description: 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.',
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"', explanation: 'fl is the longest prefix common to all strings.' }
    ],
    constraints: ['1 <= strs.length <= 200', '0 <= strs[i].length <= 200'],
    roadmapDay: 14,
    hints: { tier1: 'Start with the first string as the prefix.', tier2: 'Compare the prefix with each string and shorten it until it matches.', tier3: 'Use a while loop checking if each string starts with the current prefix.' },
    acceptanceRate: 41,
  },
  {
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'Medium',
    tags: ['Array', 'Prefix Sum'],
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'Each element is the product of all others.' }
    ],
    constraints: ['2 <= nums.length <= 10^5', 'No division allowed.'],
    roadmapDay: 15,
    hints: { tier1: 'Think about prefix products and suffix products separately.', tier2: 'answer[i] = product of all elements to the left × product of all elements to the right.', tier3: 'First pass: build prefix products. Second pass: multiply by suffix products.' },
    acceptanceRate: 65,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await Problem.deleteMany({});
    console.log('Cleared existing problems...');

    await Problem.insertMany(problems);
    console.log('15 problems seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();