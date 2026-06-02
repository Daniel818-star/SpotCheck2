import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, CATEGORY_SOURCES } from '@/lib/auth';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { claim, category } = await request.json();

    if (!claim || !category) {
      return NextResponse.json({ error: 'Claim text and category are required' }, { status: 400 });
    }

    const categoryConfig = CATEGORY_SOURCES[category];
    if (!categoryConfig) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const zai = await ZAI.create();

    // Search for the claim using category-specific trusted sources
    const searchQuery = `${claim} site:(${categoryConfig.sources.map(s => s).join(' OR ')})`;

    let searchResults: Array<{ url: string; name: string; snippet: string; host_name: string }> = [];

    try {
      const searchResponse = await zai.functions.invoke('web_search', {
        query: searchQuery,
        num: 10,
      });
      searchResults = searchResponse || [];
    } catch (searchErr) {
      console.error('Web search error, trying broader search:', searchErr);
    }

    // If specific source search yields nothing, try a broader search
    if (searchResults.length === 0) {
      try {
        const broaderQuery = `${claim} ${categoryConfig.name} news`;
        const broaderResponse = await zai.functions.invoke('web_search', {
          query: broaderQuery,
          num: 10,
        });
        searchResults = broaderResponse || [];
      } catch (broaderErr) {
        console.error('Broader search also failed:', broaderErr);
      }
    }

    // Build context from search results
    const searchContext = searchResults
      .slice(0, 8)
      .map((r, i) => `[${i + 1}] ${r.name} (${r.host_name}): ${r.snippet}`)
      .join('\n');

    // Use AI to analyze the claim against search results
    const analysisPrompt = `You are SpotCheck, an expert fake news detection AI. Analyze the following news claim in the "${categoryConfig.name}" category.

CATEGORY: ${categoryConfig.name}
TRUSTED SOURCES FOR THIS CATEGORY: ${categoryConfig.sources.join(', ')}

CLAIM TO VERIFY: "${claim}"

SEARCH RESULTS FROM TRUSTED SOURCES:
${searchContext || 'No search results found from trusted sources.'}

Based on the search results and your knowledge, provide a detailed analysis. You MUST respond in the following JSON format only (no markdown, no code blocks):

{
  "isFake": true/false,
  "confidence": <number 0-100>,
  "verdict": "<ONE WORD: REAL or FAKE or UNCERTAIN>",
  "explanation": "<2-3 sentence explanation of your reasoning>",
  "keyFindings": ["<finding 1>", "<finding 2>", "<finding 3>"],
  "trustedSourcesFound": <number of trusted sources that support/deny this claim>,
  "sourceBreakdown": [
    {"source": "<source name>", "supports": true/false, "relevance": "<brief note>"}
  ],
  "warnings": ["<any red flags or concerns>"]
}

Be thorough and evidence-based. If the claim is partially true, explain what parts are accurate and what's misleading. If you can't find enough evidence, mark it as UNCERTAIN with a lower confidence score. Consider:
1. Does the claim match information from trusted sources?
2. Are there contradictions between sources?
3. Is the claim sensationalized or misleading?
4. Are there red flags like emotional language, lack of credible sources, or logical fallacies?`;

    let analysisResult;
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are SpotCheck, a professional fake news detection AI. Always respond with valid JSON only. No markdown formatting or code blocks.',
          },
          { role: 'user', content: analysisPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content || '';
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseErr) {
      console.error('AI analysis parsing error:', parseErr);
      analysisResult = {
        isFake: null,
        confidence: 30,
        verdict: 'UNCERTAIN',
        explanation: 'Unable to fully verify this claim. The analysis could not be completed due to limited data from trusted sources.',
        keyFindings: ['Limited search results from trusted sources', 'Further manual verification recommended'],
        trustedSourcesFound: 0,
        sourceBreakdown: [],
        warnings: ['Automated analysis could not be completed fully'],
      };
    }

    // Save analysis to database
    const analysis = await db.analysis.create({
      data: {
        userId: decoded.userId,
        claim,
        category,
        result: analysisResult.verdict || 'UNCERTAIN',
        confidence: analysisResult.confidence || 0,
        sources: JSON.stringify(searchResults.slice(0, 5)),
        explanation: JSON.stringify(analysisResult),
        isFake: analysisResult.isFake ?? false,
      },
    });

    return NextResponse.json({
      id: analysis.id,
      claim,
      category,
      categoryConfig: {
        name: categoryConfig.name,
        sources: categoryConfig.sources,
        icon: categoryConfig.icon,
        color: categoryConfig.color,
      },
      analysis: analysisResult,
      searchResults: searchResults.slice(0, 5).map((r) => ({
        name: r.name,
        url: r.url,
        snippet: r.snippet,
        host_name: r.host_name,
      })),
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
