// Keyword-based auto category suggestion
const categoryKeywords = {
  food: [
    'food', 'restaurant', 'grocery', 'swiggy', 'zomato', 'uber eats', 'dominos', 'pizza', 'burger', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee', 'tea', 'snack', 'meal', 'kitchen', 'dining', 'biryani', 'sushi', 'bakery', 'supermarket', 'bigbasket', 'blinkit', 'zepto'
  ],
  travel: [
    'travel', 'trip', 'flight', 'train', 'bus', 'cab', 'taxi', 'uber', 'ola', 'petrol', 'diesel', 'fuel', 'hotel', 'booking', 'airbnb', 'vacation', 'tour', 'rental car', 'toll', 'parking', 'metro', 'auto', 'rickshaw'
  ],
  bills: [
    'bill', 'electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'phone', 'mobile', 'recharge', 'rent', 'mortgage', 'insurance', 'emi', 'loan', 'subscription', 'netflix', 'amazon prime', 'spotify', 'utility', 'tax', 'maintenance', 'cable', 'dth'
  ],
  shopping: [
    'shopping', 'amazon', 'flipkart', 'myntra', 'ajio', 'clothes', 'shoes', 'electronics', 'gadget', 'phone', 'laptop', 'furniture', 'accessories', 'jewelry', 'watch', 'bag', 'wallet', 'belt', 'dress', 'shirt', 'pants', 'online', 'mart', 'mall', 'store'
  ],
  health: [
    'health', 'doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'dental', 'clinic', 'fitness', 'gym', 'yoga', 'therapy', 'consultation', 'checkup', 'test', 'lab', 'apollo', 'practo', '1mg', 'vitamin', 'protein', 'supplement', 'insurance health'
  ],
  salary: [
    'salary', 'payroll', 'wage', 'income job', 'monthly income'
  ],
  freelance: [
    'freelance', 'consulting', 'contract', 'project', 'gig', 'upwork', 'fiverr', 'client', 'service'
  ],
  investment: [
    'investment', 'stock', 'mutual fund', 'dividend', 'interest', 'crypto', 'bitcoin', 'return', 'sip', 'fixed deposit', 'fd', 'gold', 'real estate'
  ],
  gift: [
    'gift', 'bonus', 'reward', 'cashback', 'refund', 'prize', 'present'
  ],
  others: [],
};

/**
 * Suggest category based on text input
 * @param {string} text - Note or description
 * @param {string} type - 'income' or 'expense'
 * @returns {string} - Suggested category
 */
const suggestCategory = (text, type = 'expense') => {
  if (!text) return type === 'income' ? 'salary' : 'others';

  const lowerText = text.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  // Filter categories based on type
  const relevantCategories = Object.keys(categoryKeywords).filter((cat) => {
    if (type === 'income') {
      return ['salary', 'freelance', 'investment', 'gift', 'others'].includes(cat);
    }
    return ['food', 'travel', 'bills', 'shopping', 'health', 'others'].includes(cat);
  });

  for (const category of relevantCategories) {
    const keywords = categoryKeywords[category];
    let score = 0;

    for (const keyword of keywords) {
      // Exact word match gets higher score
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const exactMatches = (lowerText.match(regex) || []).length;
      score += exactMatches * 2;

      // Partial match
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = category;
    }
  }

  return bestMatch || (type === 'income' ? 'salary' : 'others');
};

module.exports = { suggestCategory, categoryKeywords };

