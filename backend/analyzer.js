/**
 * AstraVox Interview Analyzer
 * 
 * Custom-built analysis engine for evaluating interview responses.
 * Uses NLP heuristics, keyword matching, and structural analysis
 * to score responses across multiple dimensions.
 */

// ============ KEYWORD DATABASES ============

// Filler words and hesitation markers
const FILLER_WORDS = [
    'um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally',
    'sort of', 'kind of', 'i mean', 'right', 'okay so', 'well like',
    'i guess', 'maybe', 'honestly', 'to be honest', 'just', 'really',
    'very', 'stuff', 'things', 'whatever', 'and stuff', 'or something'
];

// Weak/vague words that reduce clarity
const WEAK_WORDS = [
    'stuff', 'things', 'something', 'whatever', 'probably', 'maybe',
    'i think', 'i guess', 'kind of', 'sort of', 'pretty much', 'a lot',
    'very good', 'really nice', 'some stuff', 'different things'
];

// Strong action verbs (indicate confident communication)
const ACTION_VERBS = [
    'achieved', 'built', 'created', 'delivered', 'designed', 'developed',
    'established', 'executed', 'generated', 'implemented', 'improved',
    'increased', 'initiated', 'launched', 'led', 'managed', 'organized',
    'produced', 'reduced', 'resolved', 'spearheaded', 'streamlined',
    'transformed', 'collaborated', 'coordinated', 'analyzed', 'negotiated',
    'mentored', 'optimized', 'pioneered', 'revamped', 'supervised',
    'trained', 'architected', 'automated', 'debugged', 'deployed',
    'engineered', 'integrated', 'migrated', 'refactored', 'scaled',
    'tested', 'validated', 'documented', 'contributed', 'facilitated'
];

// STAR method indicators
const STAR_INDICATORS = {
    situation: ['situation', 'context', 'background', 'at the time', 'when i was', 'in my previous', 'at my', 'during my', 'while working', 'i was working on', 'the project was', 'our team was', 'the problem was', 'we had a', 'the challenge was'],
    task: ['task', 'responsibility', 'my role', 'i was responsible', 'i needed to', 'my goal', 'the objective', 'i had to', 'was assigned', 'was asked to', 'my job was', 'expected to', 'charged with'],
    action: ['i decided', 'i implemented', 'i created', 'i developed', 'i built', 'i took', 'i started', 'i organized', 'i led', 'i designed', 'i wrote', 'my approach', 'i collaborated', 'i analyzed', 'steps i took', 'first i', 'then i', 'next i', 'i proposed', 'i initiated', 'i set up'],
    result: ['result', 'outcome', 'as a result', 'ended up', 'achieved', 'improved by', 'reduced by', 'increased by', 'led to', 'resulted in', 'impact was', 'we were able to', 'successfully', 'this helped', 'in the end', 'ultimately', 'the effect was', 'which meant']
};

// Technical keywords by domain
const TECHNICAL_KEYWORDS = {
    general: ['algorithm', 'data structure', 'database', 'api', 'framework', 'library', 'architecture', 'design pattern', 'debugging', 'testing', 'deployment', 'version control', 'git', 'agile', 'scrum', 'ci/cd', 'rest', 'http', 'server', 'client', 'frontend', 'backend', 'fullstack', 'cloud', 'security', 'performance', 'scalability', 'optimization'],
    programming: ['function', 'class', 'object', 'variable', 'array', 'loop', 'recursion', 'iteration', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'interface', 'module', 'package', 'dependency', 'async', 'promise', 'callback', 'thread', 'process', 'memory', 'stack', 'heap', 'pointer', 'reference', 'compile', 'runtime', 'exception', 'error handling'],
    web: ['html', 'css', 'javascript', 'react', 'angular', 'vue', 'node', 'express', 'mongodb', 'sql', 'nosql', 'dom', 'component', 'state', 'props', 'routing', 'middleware', 'authentication', 'authorization', 'session', 'cookie', 'token', 'jwt', 'oauth', 'webpack', 'typescript'],
    system: ['operating system', 'linux', 'process', 'thread', 'concurrency', 'parallelism', 'mutex', 'semaphore', 'deadlock', 'cache', 'load balancer', 'proxy', 'dns', 'tcp', 'udp', 'networking', 'socket', 'microservice', 'container', 'docker', 'kubernetes', 'aws', 'gcp', 'azure']
};

// Quantitative indicators (metrics, numbers)
const QUANTITATIVE_PATTERNS = [
    /\d+\s*%/g,                    // percentages: 50%
    /\d+\s*(users|customers|people|members|team|employees)/gi,  // people counts
    /\d+\s*(hours|days|weeks|months|years)/gi,  // time durations
    /\$\s*[\d,]+/g,               // dollar amounts
    /\d+x/gi,                      // multipliers
    /improved\s+by\s+\d+/gi,      // improved by N
    /reduced\s+by\s+\d+/gi,       // reduced by N
    /increased\s+by\s+\d+/gi,     // increased by N
    /\d+\s*(projects|applications|apps|features|modules|bugs|tickets|tasks)/gi
];

// Positive sentiment words
const POSITIVE_WORDS = [
    'passionate', 'excited', 'love', 'enjoy', 'thrive', 'motivated',
    'driven', 'committed', 'dedicated', 'enthusiastic', 'eager',
    'confident', 'proud', 'accomplished', 'successful', 'grew',
    'learned', 'improved', 'developed', 'strengthened', 'value',
    'appreciate', 'grateful', 'opportunity', 'growth'
];

// Negative/uncertain sentiment
const NEGATIVE_WORDS = [
    'failed', 'couldn\'t', 'unable', 'struggled', 'difficult',
    'problem', 'issue', 'mistake', 'wrong', 'bad', 'worst',
    'hate', 'dislike', 'boring', 'don\'t know', 'not sure',
    'no idea', 'never', 'can\'t', 'won\'t'
];

// Question-specific expected content
const QUESTION_EXPECTATIONS = {
    'tell me about yourself': {
        expected: ['background', 'experience', 'education', 'skills', 'goals', 'interest', 'passion', 'project', 'currently'],
        category: 'hr'
    },
    'why do you want': {
        expected: ['company', 'mission', 'values', 'culture', 'growth', 'opportunity', 'align', 'contribute', 'impact', 'role'],
        category: 'hr'
    },
    'strengths and weaknesses': {
        expected: ['strength', 'weakness', 'improve', 'working on', 'feedback', 'example', 'overcome'],
        category: 'hr'
    },
    'where do you see yourself': {
        expected: ['goals', 'career', 'grow', 'learn', 'leadership', 'contribute', 'develop', 'advance', 'skills'],
        category: 'hr'
    },
    'challenge': {
        expected: ['situation', 'problem', 'action', 'result', 'learned', 'approach', 'solution', 'overcome'],
        category: 'behavioral'
    },
    'team': {
        expected: ['collaboration', 'communication', 'together', 'role', 'contributed', 'conflict', 'resolved', 'feedback', 'diverse'],
        category: 'behavioral'
    },
    'leadership': {
        expected: ['led', 'managed', 'delegated', 'motivated', 'vision', 'initiative', 'decision', 'team', 'result'],
        category: 'behavioral'
    },
    'failure': {
        expected: ['mistake', 'learned', 'improved', 'adjusted', 'responsibility', 'changed', 'growth', 'next time'],
        category: 'behavioral'
    },
    'sql': {
        expected: ['relational', 'structured', 'schema', 'table', 'query', 'join', 'normalization', 'acid', 'transaction'],
        category: 'technical'
    },
    'nosql': {
        expected: ['document', 'flexible', 'schema', 'scalability', 'mongodb', 'key-value', 'denormalization'],
        category: 'technical'
    },
    'rest': {
        expected: ['http', 'endpoint', 'resource', 'stateless', 'get', 'post', 'put', 'delete', 'json', 'status code'],
        category: 'technical'
    },
    'hash table': {
        expected: ['key', 'value', 'hash function', 'collision', 'bucket', 'lookup', 'o(1)', 'time complexity'],
        category: 'technical'
    },
    'design': {
        expected: ['architecture', 'component', 'scalability', 'database', 'api', 'tradeoff', 'requirement', 'load'],
        category: 'technical'
    },
    'mvc': {
        expected: ['model', 'view', 'controller', 'separation', 'concern', 'data', 'logic', 'presentation', 'request'],
        category: 'technical'
    }
};

// ============ ANALYSIS FUNCTIONS ============

/**
 * Count occurrences of phrases in text
 */
function countPhrases(text, phrases) {
    let count = 0;
    const lower = text.toLowerCase();
    phrases.forEach(phrase => {
        const regex = new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
        const matches = lower.match(regex);
        if (matches) count += matches.length;
    });
    return count;
}

/**
 * Find which phrases from a list appear in text
 */
function findMatches(text, phrases) {
    const lower = text.toLowerCase();
    return phrases.filter(phrase => {
        const regex = new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
        return regex.test(lower);
    });
}

/**
 * Analyze text structure
 */
function analyzeStructure(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.length > 0
        ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
        : 0;

    // Vocabulary richness (unique words / total words)
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(w => w.length > 2));
    const vocabRichness = words.length > 0 ? uniqueWords.size / words.length : 0;

    // Sentence length variation (good responses have varied sentence lengths)
    let sentenceVariation = 0;
    if (sentenceLengths.length > 1) {
        const mean = avgSentenceLength;
        const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / sentenceLengths.length;
        sentenceVariation = Math.sqrt(variance);
    }

    return {
        wordCount: words.length,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        vocabRichness: Math.round(vocabRichness * 100) / 100,
        sentenceVariation: Math.round(sentenceVariation * 10) / 10,
        longestSentence: Math.max(...sentenceLengths, 0),
        shortestSentence: sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0
    };
}

/**
 * Evaluate STAR method usage
 */
function evaluateSTAR(text) {
    const lower = text.toLowerCase();
    const found = {};
    let score = 0;
    const details = [];

    for (const [component, indicators] of Object.entries(STAR_INDICATORS)) {
        const matches = indicators.filter(ind => lower.includes(ind));
        found[component] = matches.length > 0;
        if (matches.length > 0) {
            score += 25;
            details.push(component.charAt(0).toUpperCase() + component.slice(1) + ': detected');
        } else {
            details.push(component.charAt(0).toUpperCase() + component.slice(1) + ': missing');
        }
    }

    return { score, found, details, componentsFound: Object.values(found).filter(v => v).length };
}

/**
 * Check how relevant the response is to the question
 */
function evaluateRelevance(question, response) {
    const questionLower = question.toLowerCase();
    const responseLower = response.toLowerCase();

    // Check against known question patterns
    let bestMatch = null;
    let bestMatchScore = 0;

    for (const [pattern, config] of Object.entries(QUESTION_EXPECTATIONS)) {
        if (questionLower.includes(pattern)) {
            const matchedKeywords = config.expected.filter(kw => responseLower.includes(kw));
            const matchScore = matchedKeywords.length / config.expected.length;
            if (matchScore > bestMatchScore) {
                bestMatchScore = matchScore;
                bestMatch = { pattern, config, matchedKeywords, matchScore };
            }
        }
    }

    // Extract key nouns/terms from the question
    const questionWords = questionLower
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !['what', 'how', 'when', 'where', 'tell', 'about', 'your', 'have', 'with', 'that', 'this', 'from', 'they', 'been', 'would', 'could', 'should', 'their', 'which', 'there', 'these', 'those', 'some', 'than', 'them', 'then', 'into', 'over', 'such', 'does', 'will', 'each', 'make', 'like', 'time', 'very', 'just', 'know', 'take', 'come', 'more', 'also'].includes(w));

    const questionKeywordsInResponse = questionWords.filter(w => responseLower.includes(w));
    const questionRelevance = questionWords.length > 0
        ? questionKeywordsInResponse.length / questionWords.length
        : 0.5;

    return {
        score: Math.round((bestMatchScore * 0.6 + questionRelevance * 0.4) * 100),
        expectedMatch: bestMatch,
        questionKeywordsFound: questionKeywordsInResponse,
        questionKeywordsTotal: questionWords.length
    };
}

/**
 * Analyze technical content depth
 */
function analyzeTechnical(text, category) {
    const allTechKeywords = [
        ...TECHNICAL_KEYWORDS.general,
        ...TECHNICAL_KEYWORDS.programming,
        ...TECHNICAL_KEYWORDS.web,
        ...TECHNICAL_KEYWORDS.system
    ];

    const foundTech = findMatches(text, allTechKeywords);
    const hasCodeExamples = /```|`[^`]+`|function\s|class\s|const\s|let\s|var\s|def\s|public\s|private\s/i.test(text);
    const hasSpecificTech = foundTech.length >= 3;

    // Check for explanatory depth (explaining concepts, not just mentioning)
    const explanatoryPhrases = [
        'this means', 'this is because', 'the reason', 'for example',
        'such as', 'in other words', 'which allows', 'which means',
        'the advantage', 'the disadvantage', 'the tradeoff', 'compared to',
        'the difference', 'works by', 'is used for', 'is responsible for'
    ];
    const explanationDepth = countPhrases(text, explanatoryPhrases);

    let score = 40; // base
    score += Math.min(foundTech.length * 5, 25);    // up to 25 for tech keywords
    score += hasCodeExamples ? 10 : 0;               // 10 for code
    score += Math.min(explanationDepth * 5, 15);     // up to 15 for explanations
    score += hasSpecificTech ? 10 : 0;               // 10 for depth

    // Boost for technical category
    if (category === 'technical') {
        score = Math.round(score * 1.1);
    }

    return {
        score: Math.min(score, 98),
        technicalTerms: foundTech,
        hasCodeExamples,
        explanationDepth
    };
}

/**
 * Analyze confidence signals in text
 */
function analyzeConfidence(text) {
    const lower = text.toLowerCase();

    // Positive confidence signals
    const assertivePatterns = ['i believe', 'i am confident', 'i successfully', 'i achieved', 'i demonstrated', 'in my experience', 'i have proven', 'i consistently', 'i am skilled', 'my expertise'];
    const assertiveCount = countPhrases(lower, assertivePatterns);

    // Negative confidence signals (hedging)
    const hedgingPatterns = ['i think maybe', 'i\'m not sure', 'i don\'t know', 'probably', 'maybe', 'i guess', 'kind of', 'sort of', 'hopefully', 'i suppose'];
    const hedgingCount = countPhrases(lower, hedgingPatterns);

    // Action verbs signal confidence
    const actionVerbCount = countPhrases(lower, ACTION_VERBS);

    // Positive vs negative sentiment
    const positiveCount = countPhrases(lower, POSITIVE_WORDS);
    const negativeCount = countPhrases(lower, NEGATIVE_WORDS);

    let score = 55; // base
    score += Math.min(assertiveCount * 6, 18);       // assertive language
    score += Math.min(actionVerbCount * 3, 15);       // action verbs
    score += Math.min(positiveCount * 3, 12);         // positive sentiment
    score -= hedgingCount * 5;                         // hedging penalty
    score -= Math.max(0, negativeCount - 2) * 3;      // some negativity is ok (e.g. talking about failures)

    return {
        score: Math.min(Math.max(score, 15), 98),
        assertiveCount,
        hedgingCount,
        actionVerbCount,
        positiveCount,
        negativeCount
    };
}

/**
 * Analyze clarity and communication quality
 */
function analyzeClarity(text, structure) {
    let score = 50; // base

    // Sentence length scoring: 12-20 words per sentence is ideal
    if (structure.avgSentenceLength >= 10 && structure.avgSentenceLength <= 22) {
        score += 15; // good range
    } else if (structure.avgSentenceLength > 30) {
        score -= 10; // too long, hard to follow
    } else if (structure.avgSentenceLength < 6) {
        score -= 5;  // too short, choppy
    }

    // Vocabulary richness
    if (structure.vocabRichness > 0.5) score += 10;
    else if (structure.vocabRichness > 0.4) score += 5;

    // Sentence variation is good (not all same length)
    if (structure.sentenceVariation > 3 && structure.sentenceVariation < 15) score += 8;

    // Weak word penalty
    const weakCount = countPhrases(text, WEAK_WORDS);
    score -= Math.min(weakCount * 3, 15);

    // Multiple sentences show structured thinking
    if (structure.sentenceCount >= 4) score += 8;
    else if (structure.sentenceCount >= 2) score += 4;

    // Word count: 50-300 words is generally good for an interview answer
    if (structure.wordCount >= 50 && structure.wordCount <= 300) score += 10;
    else if (structure.wordCount > 300) score += 5; // still ok but might be rambly
    else score -= 5; // too short

    // Transition words signal organized thinking
    const transitionWords = ['first', 'second', 'third', 'additionally', 'furthermore', 'moreover', 'however', 'therefore', 'consequently', 'in conclusion', 'finally', 'to summarize', 'as a result', 'on the other hand', 'for instance', 'specifically', 'in particular', 'next', 'then', 'after that', 'before that'];
    const transitionCount = countPhrases(text, transitionWords);
    score += Math.min(transitionCount * 4, 12);

    return {
        score: Math.min(Math.max(score, 15), 98),
        weakWordCount: weakCount,
        transitionCount
    };
}

/**
 * Analyze communication quality
 */
function analyzeCommunication(text, structure, starResult) {
    let score = 50; // base

    // STAR method usage is great for communication
    score += starResult.score * 0.2; // up to 20 points from STAR

    // Quantitative results (numbers, percentages, metrics)
    let quantCount = 0;
    QUANTITATIVE_PATTERNS.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) quantCount += matches.length;
    });
    score += Math.min(quantCount * 5, 15);

    // Specific examples (not just abstract)
    const exampleIndicators = ['for example', 'for instance', 'such as', 'specifically', 'in particular', 'one time', 'one example', 'a specific', 'i remember', 'there was a time', 'in one case', 'a good example'];
    const exampleCount = countPhrases(text, exampleIndicators);
    score += Math.min(exampleCount * 5, 15);

    // Response length scoring
    if (structure.wordCount >= 80 && structure.wordCount <= 250) score += 8;
    else if (structure.wordCount >= 40) score += 4;

    // Professional language
    const professionalTerms = ['stakeholder', 'deliverable', 'milestone', 'deadline', 'requirement', 'objective', 'strategy', 'priority', 'initiative', 'collaboration', 'communication', 'feedback', 'iteration', 'process', 'workflow'];
    const profCount = countPhrases(text, professionalTerms);
    score += Math.min(profCount * 3, 10);

    return {
        score: Math.min(Math.max(score, 15), 98),
        quantitativeCount: quantCount,
        exampleCount,
        professionalTermCount: profCount
    };
}

// ============ FEEDBACK GENERATION ============

/**
 * Generate specific, contextual strengths based on analysis
 */
function generateStrengths(analysis) {
    const strengths = [];

    // Structure-based strengths
    if (analysis.structure.wordCount >= 80 && analysis.structure.wordCount <= 300) {
        strengths.push('Response length is appropriate for an interview answer (' + analysis.structure.wordCount + ' words)');
    }
    if (analysis.structure.sentenceCount >= 4) {
        strengths.push('Well-structured response with multiple complete thoughts');
    }
    if (analysis.structure.vocabRichness > 0.5) {
        strengths.push('Good vocabulary variety - avoids being repetitive');
    }

    // STAR method strengths
    if (analysis.star.componentsFound >= 3) {
        strengths.push('Strong use of the STAR method (' + analysis.star.componentsFound + '/4 components present)');
    } else if (analysis.star.componentsFound >= 2) {
        strengths.push('Shows elements of structured storytelling (STAR method partially used)');
    }

    // Confidence strengths
    if (analysis.confidence.actionVerbCount >= 3) {
        strengths.push('Good use of action verbs that demonstrate ownership and initiative');
    }
    if (analysis.confidence.assertiveCount >= 2) {
        strengths.push('Confident and assertive language throughout the response');
    }
    if (analysis.confidence.positiveCount >= 2) {
        strengths.push('Positive and enthusiastic tone conveys genuine interest');
    }

    // Technical strengths
    if (analysis.technical.technicalTerms.length >= 3) {
        strengths.push('Demonstrates technical knowledge with relevant terminology (' + analysis.technical.technicalTerms.slice(0, 4).join(', ') + ')');
    }
    if (analysis.technical.hasCodeExamples) {
        strengths.push('Includes concrete technical examples to support points');
    }
    if (analysis.technical.explanationDepth >= 2) {
        strengths.push('Good explanatory depth - goes beyond surface-level answers');
    }

    // Communication strengths
    if (analysis.communication.quantitativeCount >= 1) {
        strengths.push('Uses quantifiable results/metrics to demonstrate impact');
    }
    if (analysis.communication.exampleCount >= 1) {
        strengths.push('Provides specific examples to illustrate points');
    }

    // Relevance strengths
    if (analysis.relevance.score >= 60) {
        strengths.push('Response directly addresses the question asked');
    }

    // Filler word strength
    if (analysis.fillerCount === 0) {
        strengths.push('Clean delivery with no filler words detected');
    }

    // Return top strengths (at least 3, at most 5)
    if (strengths.length < 3) {
        const fallbacks = [
            'Provides a complete answer to the question',
            'Shows willingness to share experiences',
            'Response demonstrates thought and effort'
        ];
        while (strengths.length < 3) {
            strengths.push(fallbacks[strengths.length]);
        }
    }

    return strengths.slice(0, 5);
}

/**
 * Generate specific, contextual weaknesses based on analysis
 */
function generateWeaknesses(analysis) {
    const weaknesses = [];

    // Filler words
    if (analysis.fillerCount > 0) {
        weaknesses.push('Detected ' + analysis.fillerCount + ' filler word(s) — try to reduce "um", "like", "basically" etc.');
    }

    // Length issues
    if (analysis.structure.wordCount < 40) {
        weaknesses.push('Response is too brief (' + analysis.structure.wordCount + ' words) — aim for 80-200 words to give a complete answer');
    } else if (analysis.structure.wordCount > 350) {
        weaknesses.push('Response may be too long (' + analysis.structure.wordCount + ' words) — try to be more concise while keeping key points');
    }

    // STAR method gaps
    if (analysis.star.componentsFound < 3 && ['behavioral', 'general'].includes(analysis.category)) {
        const missing = Object.entries(analysis.star.found)
            .filter(([_, v]) => !v)
            .map(([k, _]) => k);
        weaknesses.push('Missing STAR method components: ' + missing.join(', ') + ' — adding these would strengthen your answer');
    }

    // Clarity issues
    if (analysis.structure.avgSentenceLength > 28) {
        weaknesses.push('Sentences are too long (avg ' + analysis.structure.avgSentenceLength + ' words) — break into shorter, clearer sentences');
    }
    if (analysis.clarity.weakWordCount > 3) {
        weaknesses.push('Uses vague language (' + analysis.clarity.weakWordCount + ' weak/vague words detected) — be more specific');
    }

    // Confidence issues
    if (analysis.confidence.hedgingCount > 2) {
        weaknesses.push('Too much hedging language ("I think", "maybe", "I guess") — be more direct and confident');
    }
    if (analysis.confidence.actionVerbCount < 2) {
        weaknesses.push('Lacks strong action verbs — use words like "achieved", "built", "led", "improved" to show impact');
    }

    // No metrics
    if (analysis.communication.quantitativeCount === 0) {
        weaknesses.push('No quantifiable results mentioned — add numbers, percentages, or metrics to demonstrate impact');
    }

    // No examples
    if (analysis.communication.exampleCount === 0 && analysis.structure.wordCount > 30) {
        weaknesses.push('Missing specific examples — use concrete stories instead of general statements');
    }

    // Relevance
    if (analysis.relevance.score < 40) {
        weaknesses.push('Response may not fully address the question — make sure to connect your answer back to what was asked');
    }

    // Low vocab richness
    if (analysis.structure.vocabRichness < 0.35 && analysis.structure.wordCount > 50) {
        weaknesses.push('Repetitive vocabulary — try varying your word choice for a more engaging response');
    }

    // Technical depth
    if (analysis.category === 'technical' && analysis.technical.technicalTerms.length < 2) {
        weaknesses.push('Technical response lacks specific terminology — include relevant concepts and tools');
    }

    // Return top weaknesses (at least 2, at most 5)
    if (weaknesses.length < 2) {
        weaknesses.push('Consider adding more depth or detail to strengthen your answer');
    }

    return weaknesses.slice(0, 5);
}

/**
 * Generate contextual improvement tips
 */
function generateTips(analysis) {
    const tips = [];

    // Category-specific tips
    if (analysis.category === 'behavioral') {
        if (analysis.star.componentsFound < 4) {
            tips.push('Use the STAR method: describe the Situation, Task, Action you took, and the Result you achieved');
        }
        tips.push('Prepare 3-5 versatile stories from your experience that can be adapted to different behavioral questions');
        if (analysis.communication.quantitativeCount === 0) {
            tips.push('Always try to quantify your impact: "increased efficiency by 30%" is stronger than "made things better"');
        }
    } else if (analysis.category === 'technical') {
        if (analysis.technical.explanationDepth < 2) {
            tips.push('Don\'t just state facts — explain WHY things work the way they do and discuss tradeoffs');
        }
        tips.push('When explaining technical concepts, use analogies to make complex ideas accessible');
        if (analysis.technical.technicalTerms.length < 3) {
            tips.push('Show depth by mentioning related concepts, alternatives, and when you\'d choose one approach over another');
        }
    } else {
        tips.push('Research the company beforehand to tailor your answers to their values and culture');
        tips.push('End your answers by connecting your experience back to how you\'d contribute to the role');
    }

    // General tips based on weaknesses
    if (analysis.fillerCount > 2) {
        tips.push('Record yourself practicing and count filler words — awareness is the first step to reducing them');
    }
    if (analysis.structure.wordCount < 60) {
        tips.push('Practice expanding your answers: ask yourself "What was the situation? What did I do? What was the result?"');
    }
    if (analysis.confidence.hedgingCount > 1) {
        tips.push('Replace hedging phrases: instead of "I think I might be good at..." say "One of my strengths is..."');
    }
    if (analysis.clarity.transitionCount < 2) {
        tips.push('Use transition words (First... Then... As a result...) to make your answer flow more logically');
    }

    // Always include practice tip
    tips.push('Practice saying your answer out loud — hearing yourself helps identify areas that sound unnatural');

    return tips.slice(0, 4);
}

/**
 * Determine speaking pace category
 */
function evaluatePace(structure) {
    const wps = structure.avgSentenceLength;
    if (wps > 25) return 'fast';
    if (wps < 8) return 'slow';
    return 'normal';
}

// ============ MAIN ANALYSIS FUNCTION ============

/**
 * Perform full interview response analysis
 * @param {string} question - The interview question
 * @param {string} response - The candidate's response
 * @param {string} category - Category: behavioral, technical, hr, general
 * @returns {object} Complete analysis with scores, strengths, weaknesses, tips
 */
function analyzeInterview(question, response, category) {
    // Core analysis
    const structure = analyzeStructure(response);
    const fillerCount = countPhrases(response, FILLER_WORDS);
    const star = evaluateSTAR(response);
    const relevance = evaluateRelevance(question, response);
    const technical = analyzeTechnical(response, category);
    const confidence = analyzeConfidence(response);
    const clarity = analyzeClarity(response, structure);
    const communication = analyzeCommunication(response, structure, star);

    // Combine into analysis object
    const analysis = {
        structure,
        fillerCount,
        star,
        relevance,
        technical,
        confidence,
        clarity,
        communication,
        category
    };

    // Calculate final scores with category weighting
    let scores = {
        confidence: confidence.score,
        clarity: clarity.score,
        communication: communication.score,
        technical: technical.score
    };

    // Apply relevance modifier (up to +/- 10)
    const relevanceModifier = Math.round((relevance.score - 50) * 0.2);
    scores.confidence = Math.min(Math.max(scores.confidence + relevanceModifier, 15), 98);
    scores.clarity = Math.min(Math.max(scores.clarity + relevanceModifier, 15), 98);
    scores.communication = Math.min(Math.max(scores.communication + relevanceModifier, 15), 98);

    // Apply filler word penalty across the board
    const fillerPenalty = Math.min(fillerCount * 3, 15);
    scores.confidence = Math.max(scores.confidence - fillerPenalty, 15);
    scores.communication = Math.max(scores.communication - fillerPenalty, 15);

    // Category-specific weighting for overall score
    let weights;
    if (category === 'technical') {
        weights = { confidence: 0.15, clarity: 0.25, communication: 0.20, technical: 0.40 };
    } else if (category === 'behavioral') {
        weights = { confidence: 0.25, clarity: 0.20, communication: 0.35, technical: 0.20 };
    } else {
        weights = { confidence: 0.30, clarity: 0.25, communication: 0.30, technical: 0.15 };
    }

    scores.overall = Math.round(
        scores.confidence * weights.confidence +
        scores.clarity * weights.clarity +
        scores.communication * weights.communication +
        scores.technical * weights.technical
    );

    // Generate feedback
    const strengths = generateStrengths(analysis);
    const weaknesses = generateWeaknesses(analysis);
    const tips = generateTips(analysis);
    const speakingPace = evaluatePace(structure);

    return {
        scores,
        strengths,
        weaknesses,
        tips,
        fillerWords: fillerCount,
        speakingPace,
        // Include detailed breakdown for debugging / future use
        details: {
            wordCount: structure.wordCount,
            sentenceCount: structure.sentenceCount,
            avgSentenceLength: structure.avgSentenceLength,
            vocabRichness: structure.vocabRichness,
            starComponents: star.componentsFound,
            relevanceScore: relevance.score,
            actionVerbs: confidence.actionVerbCount,
            technicalTerms: technical.technicalTerms.length,
            quantitativeResults: communication.quantitativeCount,
            weakWords: clarity.weakWordCount
        }
    };
}

module.exports = { analyzeInterview };
