import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export const useFAQMatcher = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setFaqs(data || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const findBestMatch = (userMessage: string): FAQ | null => {
    if (!userMessage || faqs.length === 0) return null;

    const messageLower = userMessage.toLowerCase();
    let bestMatch: FAQ | null = null;
    let highestScore = 0;

    for (const faq of faqs) {
      let score = 0;

      // Check if question contains similar words
      const questionWords = faq.question.toLowerCase().split(/\s+/);
      const messageWords = messageLower.split(/\s+/);
      
      for (const word of messageWords) {
        if (word.length > 2) { // Only consider words longer than 2 characters
          for (const qWord of questionWords) {
            if (qWord.includes(word) || word.includes(qWord)) {
              score += 2;
            }
          }
        }
      }

      // Check keywords
      for (const keyword of faq.keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          score += 3; // Keywords have higher weight
        }
      }

      // Bonus for exact phrase matches in question
      const questionLower = faq.question.toLowerCase();
      for (const word of messageWords) {
        if (word.length > 3 && questionLower.includes(word)) {
          score += 1;
        }
      }

      if (score > highestScore && score >= 3) { // Minimum threshold
        highestScore = score;
        bestMatch = faq;
      }
    }

    return bestMatch;
  };

  const generateResponse = (userMessage: string): string => {
    const bestMatch = findBestMatch(userMessage);
    
    if (bestMatch) {
      return `${bestMatch.answer}\n\n*This answer is based on our FAQ: "${bestMatch.question}"*`;
    }

    // Fallback response
    return `I'd be happy to help you with your electric scooter question! While I don't have a specific answer for "${userMessage}" in my current knowledge base, here are some general tips:

• Check our FAQ sections for common questions about battery, charging, maintenance, and safety
• For technical issues, ensure your scooter is charged and all connections are secure
• For warranty or specific model questions, please contact our support team

Is there anything specific about electric scooters I can help you with? I have information about range, charging, speed, maintenance, safety gear, and more!`;
  };

  return {
    faqs,
    loading,
    findBestMatch,
    generateResponse
  };
};