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
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('FAQ fetch error:', error);
          throw new Error(`Failed to load FAQ data: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          console.warn('No FAQ data found in database');
        }
        
        setFaqs(data || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        // Continue with empty FAQs array to prevent app crash
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const findBestMatch = (userMessage: string): FAQ | null => {
    if (!userMessage || faqs.length === 0) return null;

    const messageLower = userMessage.toLowerCase().trim();
    
    // Common words to ignore (stop words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    let bestMatch: FAQ | null = null;
    let highestScore = 0;

    for (const faq of faqs) {
      let score = 0;
      let relevanceScore = 0;

      const questionLower = faq.question.toLowerCase();
      const answerLower = faq.answer.toLowerCase();
      
      // Filter out stop words from both message and question
      const messageWords = messageLower.split(/\s+/).filter(word => 
        word.length > 2 && !stopWords.has(word) && /^[a-zA-Z]+$/.test(word)
      );
      const questionWords = questionLower.split(/\s+/).filter(word => 
        word.length > 2 && !stopWords.has(word) && /^[a-zA-Z]+$/.test(word)
      );

      // Exact phrase matching (higher weight)
      const messagePhrases = messageLower.split(/[.!?;,]/).map(p => p.trim()).filter(p => p.length > 5);
      for (const phrase of messagePhrases) {
        if (questionLower.includes(phrase) || answerLower.includes(phrase)) {
          score += 8;
          relevanceScore += 3;
        }
      }

      // Multi-word sequence matching
      for (let i = 0; i < messageWords.length - 1; i++) {
        const twoWordPhrase = messageWords[i] + ' ' + messageWords[i + 1];
        if (questionLower.includes(twoWordPhrase) || answerLower.includes(twoWordPhrase)) {
          score += 6;
          relevanceScore += 2;
        }
      }

      // Individual word matching with context awareness
      let matchedWords = 0;
      for (const word of messageWords) {
        let wordMatched = false;
        
        // Exact word match
        if (questionWords.includes(word)) {
          score += 4;
          matchedWords++;
          wordMatched = true;
        }
        
        // Partial word match (only for longer words)
        if (!wordMatched && word.length > 4) {
          for (const qWord of questionWords) {
            if (qWord.includes(word) || word.includes(qWord)) {
              score += 2;
              matchedWords++;
              wordMatched = true;
              break;
            }
          }
        }
        
        // Check in answer for better context
        if (!wordMatched && answerLower.includes(word)) {
          score += 1;
          matchedWords++;
        }
      }

      // Calculate relevance percentage
      if (messageWords.length > 0) {
        relevanceScore += (matchedWords / messageWords.length) * 5;
      }

      // Check keywords with higher precision
      for (const keyword of faq.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (messageLower.includes(keywordLower)) {
          // Bonus if keyword appears as whole word
          const keywordRegex = new RegExp(`\\b${keywordLower}\\b`);
          if (keywordRegex.test(messageLower)) {
            score += 6;
            relevanceScore += 2;
          } else {
            score += 3;
            relevanceScore += 1;
          }
        }
      }

      // Apply relevance factor to final score
      const finalScore = relevanceScore > 2 ? score * (relevanceScore / 5) : 0;

      // Higher threshold and require good relevance
      if (finalScore > highestScore && finalScore >= 8 && relevanceScore >= 3) {
        highestScore = finalScore;
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