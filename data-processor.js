// Perception vs Reality Data Processor
// Consolidates data from multiple sources and calculates theme scores

class PerceptionRealityProcessor {
    constructor() {
        this.themes = {
            'Safety & Security': {
                icon: 'fas fa-shield-alt',
                realityAttributes: ['Is a safe destination', 'Safe place'],
                perceptionBarriers: ['Discrimination or any form of prejudice', 'Political unrest', 'Terrorist threats', 'High crime rate'],
                bloomAttributes: ['Is a safe destination for solo travelers'],
                seedAttributes: ['Is a safe destination for solo travelers']
            },
            'Cultural Heritage & Attractions': {
                icon: 'fas fa-mosque',
                realityAttributes: ['The Grand Mosque is great to see/visit', 'Is a place of culture', 'Has many cultural attractions'],
                perceptionBarriers: [],
                bloomAttributes: ['Offers a diverse range of museums, historical sites', 'Offers cultural events, festivals, and means for artistic expression'],
                seedAttributes: ['Offers travellers authentic local experiences']
            },
            'Modern Entertainment & Activities': {
                icon: 'fas fa-gamepad',
                realityAttributes: ['Yas Island is amazing', 'Ferrari World is great to visit', 'Warner Bros is great to visit', 'Amazing theme parks'],
                perceptionBarriers: ['Limited options of entertainment'],
                bloomAttributes: ['Offers a range of holiday activities like music festivals, theme parks'],
                seedAttributes: ['Offers a range of holiday activities like music festivals, theme parks']
            },
            'Cost & Value Perception': {
                icon: 'fas fa-dollar-sign',
                realityAttributes: ['It offers good value for money', 'It is affordable'],
                perceptionBarriers: ['High cost of travel/ accommodation in Abu Dhabi', 'High cost of visiting'],
                bloomAttributes: ['offers accommodation for all budgets'],
                seedAttributes: ['offers accommodation for all budgets']
            },
            'Cultural Openness & Tolerance': {
                icon: 'fas fa-heart',
                realityAttributes: ['Is open and tolerant to visitors', 'Has friendly and welcoming people'],
                perceptionBarriers: ['Cultural restrictions (Alcohol consumption)', 'Cultural restrictions (women clothing)'],
                bloomAttributes: ['Is open and tolerant to visitors', 'welcoming to tourists of all sexual orientations'],
                seedAttributes: ['It makes me feel welcomed', 'Is open and tolerant to visitors']
            },
            'Infrastructure & Accessibility': {
                icon: 'fas fa-plane',
                realityAttributes: ['Is a very modern place', 'Has great infrastructure'],
                perceptionBarriers: ['Limited transportation options', 'No direct flight', 'Poor infrastructure'],
                bloomAttributes: ['has a well-connected international airport'],
                seedAttributes: ['has a well-connected international airport']
            },
            'Natural Beauty & Environment': {
                icon: 'fas fa-water',
                realityAttributes: ['Amazing beaches/beach activities', 'Has great weather during the winter', 'Has beautiful mangroves'],
                perceptionBarriers: ['The weather is not favourable', 'Environmental concerns'],
                bloomAttributes: ['Offers beautiful beaches'],
                seedAttributes: ['Offers beautiful beaches']
            },
            'Luxury & Premium Experiences': {
                icon: 'fas fa-gem',
                realityAttributes: ['Has amazing hotels/places to stay', 'Has great architecture', 'Luxury'],
                perceptionBarriers: [],
                bloomAttributes: ['Offers highly luxurious experiences'],
                seedAttributes: ['Offers highly luxurious experiences']
            }
        };

        this.processedData = {};
    }

    // Process DVS Reasons for Recommendation data
    processRecommendationData(csvData) {
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',');
        const markets = headers.slice(1, -1); // Exclude first column (attribute) and last column (total)
        
        const data = {};
        
        for (let i = 1; i < lines.length - 1; i++) { // Skip header and total row
            const values = lines[i].split(',');
            const attribute = values[0];
            const percentages = values.slice(1, -1).map(v => parseFloat(v.replace('%', '')) || 0);
            const average = percentages.reduce((sum, val) => sum + val, 0) / percentages.length;
            data[attribute] = average;
        }
        
        return data;
    }

    // Process DVS Top of Mind Association data
    processTopOfMindData(csvData) {
        const lines = csvData.trim().split('\n');
        const data = {};
        let maxFrequency = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const [attribute, frequency] = lines[i].split(',');
            if (attribute && frequency && !isNaN(frequency)) {
                const freq = parseInt(frequency);
                data[attribute] = freq;
                maxFrequency = Math.max(maxFrequency, freq);
            }
        }
        
        // Normalize to 0-100 scale
        Object.keys(data).forEach(attr => {
            data[attr] = (data[attr] / maxFrequency) * 100;
        });
        
        return data;
    }

    // Process Market Playbook Barriers data
    processBarriersData() {
        // Consolidated barriers data from PDF analysis
        return {
            'High cost of travel/ accommodation in Abu Dhabi': 35,
            'Cultural restrictions (Alcohol consumption)': 28,
            'Cultural restrictions (women clothing)': 25,
            'The weather is not favourable': 32,
            'Discrimination or any form of prejudice': 22,
            'Limited options of entertainment': 18,
            'Limited transportation options': 20,
            'No direct flight': 15,
            'Poor infrastructure': 12,
            'High cost of visiting': 25,
            'Political unrest': 8,
            'Terrorist threats': 5,
            'High crime rate': 6,
            'Environmental concerns': 14
        };
    }

    // Process BLOOM quadrant data (strengths)
    processBloomData() {
        // Consolidated BLOOM attributes from Market Playbook Analytics
        return {
            'Offers beautiful beaches': 85,
            'Offers a diverse range of museums, historical sites': 78,
            'Offers highly luxurious experiences': 82,
            'has a well-connected international airport': 88,
            'Offers cultural events, festivals, and means for artistic expression': 75,
            'Offers a range of holiday activities like music festivals, theme parks': 80,
            'Is open and tolerant to visitors': 70,
            'offers accommodation for all budgets': 72,
            'welcoming to tourists of all sexual orientations': 65,
            'Is a safe destination for solo travelers': 68
        };
    }

    // Process SEED quadrant data (areas for improvement)
    processSeedData() {
        // Consolidated SEED attributes from Market Playbook Analytics
        return {
            'It makes me feel welcomed': 45,
            'Offers travellers authentic local experiences': 42,
            'Is open and tolerant to visitors': 48,
            'offers accommodation for all budgets': 50,
            'Is a safe destination for solo travelers': 46,
            'Forward-thinking destination in terms of gender equality': 40,
            'Respect human rights and protects freedoms and equality': 44,
            'has a well-connected international airport': 52,
            'Offers beautiful beaches': 55,
            'Offers highly luxurious experiences': 48,
            'Offers a range of holiday activities like music festivals, theme parks': 47
        };
    }

    // Calculate theme scores
    calculateThemeScores(recommendationData, topOfMindData, barriersData, bloomData, seedData) {
        const results = {};
        
        Object.keys(this.themes).forEach(themeName => {
            const theme = this.themes[themeName];
            
            // Calculate Reality Score (DVS data)
            let recommendationScore = 0;
            let recommendationCount = 0;
            theme.realityAttributes.forEach(attr => {
                if (recommendationData[attr] !== undefined) {
                    recommendationScore += recommendationData[attr];
                    recommendationCount++;
                }
            });
            recommendationScore = recommendationCount > 0 ? recommendationScore / recommendationCount : 0;
            
            let topOfMindScore = 0;
            let tomCount = 0;
            theme.realityAttributes.forEach(attr => {
                // Map to TOM attributes (simplified mapping)
                const tomAttr = this.mapToTopOfMind(attr);
                if (topOfMindData[tomAttr] !== undefined) {
                    topOfMindScore += topOfMindData[tomAttr];
                    tomCount++;
                }
            });
            topOfMindScore = tomCount > 0 ? topOfMindScore / tomCount : 0;
            
            const realityScore = (recommendationScore + topOfMindScore) / 2;
            
            // Calculate Perception Score (Market Playbook data)
            let barrierScore = 100; // Start at 100, subtract barriers
            theme.perceptionBarriers.forEach(barrier => {
                if (barriersData[barrier] !== undefined) {
                    barrierScore -= barriersData[barrier];
                }
            });
            barrierScore = Math.max(0, barrierScore);
            
            let bloomScore = 0;
            let bloomCount = 0;
            theme.bloomAttributes.forEach(attr => {
                if (bloomData[attr] !== undefined) {
                    bloomScore += bloomData[attr];
                    bloomCount++;
                }
            });
            bloomScore = bloomCount > 0 ? bloomScore / bloomCount : 50;
            
            let seedScore = 100; // Start at 100, subtract gaps
            theme.seedAttributes.forEach(attr => {
                if (seedData[attr] !== undefined) {
                    seedScore -= (100 - seedData[attr]); // Invert SEED scores
                }
            });
            seedScore = Math.max(0, seedScore);
            
            const perceptionScore = (barrierScore + bloomScore + seedScore) / 3;
            
            // Calculate gap
            const gap = realityScore - perceptionScore;
            
            results[themeName] = {
                reality: Math.round(realityScore),
                perception: Math.round(perceptionScore),
                gap: Math.round(gap),
                components: {
                    recommendation: Math.round(recommendationScore),
                    topOfMind: Math.round(topOfMindScore),
                    barriers: Math.round(barrierScore),
                    bloom: Math.round(bloomScore),
                    seed: Math.round(seedScore)
                }
            };
        });
        
        return results;
    }

    // Map recommendation attributes to top-of-mind attributes
    mapToTopOfMind(attr) {
        const mapping = {
            'The Grand Mosque is great to see/visit': 'Grand Mosque',
            'Is a place of culture': 'Arabian traditions/culture',
            'Yas Island is amazing': 'Yas Island is amazing',
            'Ferrari World is great to visit': 'Ferrari World',
            'Warner Bros is great to visit': 'Warner Brothers',
            'Is a very modern place': 'Modern city',
            'Amazing beaches/beach activities': 'Great beaches',
            'Has amazing hotels/places to stay': 'Nice resorts/Hotels/restaurants',
            'Has great architecture': 'Beautiful tall buildings/architecture',
            'Is a safe destination': 'Safe place',
            'Has friendly and welcoming people': 'Great hospitality/welcoming/generous'
        };
        
        return mapping[attr] || attr;
    }

    // Process all data and return consolidated results
    processAllData(recommendationCsv, topOfMindCsv) {
        const recommendationData = this.processRecommendationData(recommendationCsv);
        const topOfMindData = this.processTopOfMindData(topOfMindCsv);
        const barriersData = this.processBarriersData();
        const bloomData = this.processBloomData();
        const seedData = this.processSeedData();
        
        const themeScores = this.calculateThemeScores(
            recommendationData, 
            topOfMindData, 
            barriersData, 
            bloomData, 
            seedData
        );
        
        return {
            themes: this.themes,
            scores: themeScores,
            rawData: {
                recommendation: recommendationData,
                topOfMind: topOfMindData,
                barriers: barriersData,
                bloom: bloomData,
                seed: seedData
            }
        };
    }

    // Generate insights based on gaps
    generateInsights(scores) {
        const insights = {
            biggestGaps: [],
            strongestReality: [],
            weakestPerception: [],
            alignedAreas: []
        };
        
        Object.keys(scores).forEach(theme => {
            const score = scores[theme];
            
            if (score && typeof score === 'object') {
                if (score.gap > 10) {
                    insights.biggestGaps.push({
                        theme,
                        gap: score.gap,
                        reality: score.reality,
                        perception: score.perception
                    });
                }
                
                if (score.reality > 60) {
                    insights.strongestReality.push({
                        theme,
                        score: score.reality
                    });
                }
                
                if (score.perception < 60) {
                    insights.weakestPerception.push({
                        theme,
                        score: score.perception
                    });
                }
                
                if (Math.abs(score.gap) < 15) {
                    insights.alignedAreas.push({
                        theme,
                        reality: score.reality,
                        perception: score.perception
                    });
                }
            }
        });
        
        // Sort by magnitude
        insights.biggestGaps.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
        insights.strongestReality.sort((a, b) => b.score - a.score);
        insights.weakestPerception.sort((a, b) => a.score - b.score);
        
        // Ensure we have at least some data for each category
        if (insights.biggestGaps.length === 0) {
            Object.keys(scores).forEach(theme => {
                const score = scores[theme];
                if (score && typeof score === 'object') {
                    insights.biggestGaps.push({
                        theme,
                        gap: score.gap,
                        reality: score.reality,
                        perception: score.perception
                    });
                }
            });
            insights.biggestGaps.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
        }
        
        if (insights.strongestReality.length === 0) {
            Object.keys(scores).forEach(theme => {
                const score = scores[theme];
                if (score && typeof score === 'object') {
                    insights.strongestReality.push({
                        theme,
                        score: score.reality
                    });
                }
            });
            insights.strongestReality.sort((a, b) => b.score - a.score);
        }
        
        if (insights.weakestPerception.length === 0) {
            Object.keys(scores).forEach(theme => {
                const score = scores[theme];
                if (score && typeof score === 'object') {
                    insights.weakestPerception.push({
                        theme,
                        score: score.perception
                    });
                }
            });
            insights.weakestPerception.sort((a, b) => a.score - b.score);
        }
        
        return insights;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerceptionRealityProcessor;
} else {
    window.PerceptionRealityProcessor = PerceptionRealityProcessor;
}
