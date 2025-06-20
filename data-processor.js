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

// Initialize and expose processed data globally for validation
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window !== 'undefined' && !window.perceptionRealityData) {
        // Sample data for validation
        const sampleRecommendationCsv = `REASONS FOR RECOMMENDING BY NATIONALITY,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,
,Bahrain,Belgium,Canada,China,Egypt,France,Germany,India,Italy,Kazakhstan,Kuwait,Malaysia,Netherlands,Oman,Poland,Qatar,Russia,Saudi Arabia,South Korea,Spain,United Kingdom,UNITED STATES
Is a safe destination,81%,85%,84%,84%,94%,91%,89%,81%,91%,86%,82%,93%,92%,82%,82%,90%,92%,87%,90%,86%,91%,89%
The Grand Mosque is great to see/visit,50%,60%,64%,77%,82%,74%,67%,62%,73%,83%,40%,80%,63%,59%,68%,61%,66%,63%,88%,70%,69%,69%
Is a very modern place,70%,59%,64%,56%,85%,66%,62%,66%,65%,76%,68%,80%,60%,64%,72%,71%,60%,80%,81%,70%,62%,66%
Is a place of culture,49%,51%,67%,71%,76%,66%,51%,58%,70%,78%,57%,67%,67%,65%,64%,60%,57%,71%,81%,62%,67%,68%
Yas Island is amazing,79%,45%,52%,51%,83%,47%,45%,67%,51%,48%,80%,57%,54%,76%,62%,69%,49%,82%,55%,55%,66%,60%
Has great architecture,36%,49%,60%,59%,76%,59%,53%,60%,58%,61%,54%,65%,57%,59%,54%,64%,56%,68%,82%,63%,58%,58%
Is a strong blend of the traditional and the new,50%,49%,53%,54%,74%,62%,56%,54%,52%,61%,58%,62%,46%,61%,51%,63%,50%,70%,69%,64%,57%,53%
Has many interesting things to see and do,57%,53%,56%,49%,69%,59%,52%,59%,55%,69%,58%,60%,47%,59%,61%,57%,51%,61%,68%,58%,56%,53%
Has many attractions for the whole family,64%,47%,47%,45%,71%,54%,45%,60%,50%,68%,66%,59%,53%,65%,46%,56%,48%,75%,70%,56%,58%,52%
Has many cultural attractions,42%,50%,41%,53%,64%,54%,47%,50%,56%,62%,48%,68%,43%,54%,47%,55%,44%,60%,66%,47%,51%,52%
Has friendly and welcoming people,46%,35%,49%,46%,44%,51%,50%,51%,54%,50%,47%,47%,46%,41%,52%,44%,42%,55%,53%,50%,50%,53%
Has amazing hotels/places to stay,64%,32%,40%,36%,65%,48%,38%,46%,41%,60%,56%,68%,49%,54%,34%,66%,39%,66%,55%,46%,45%,41%
Warner Bros is great to visit,61%,35%,40%,41%,59%,36%,29%,47%,37%,32%,70%,33%,31%,66%,40%,59%,29%,72%,42%,38%,44%,45%
Amazing beaches/beach activities,45%,38%,36%,28%,73%,39%,38%,38%,35%,64%,48%,69%,36%,56%,31%,63%,40%,54%,45%,38%,40%,31%
Louvre Abu Dhabi is great to see/visit,23%,35%,38%,38%,44%,53%,34%,26%,50%,29%,24%,64%,30%,34%,29%,38%,39%,41%,43%,37%,43%,35%
Has great weather during the winter,18%,31%,49%,36%,32%,35%,39%,26%,42%,19%,30%,8%,34%,34%,14%,33%,40%,44%,4%,37%,38%,31%
Is open and tolerant to visitors,36%,26%,31%,27%,34%,30%,31%,30%,32%,35%,32%,37%,24%,27%,32%,34%,29%,32%,43%,29%,33%,27%
Is great for shopping,29%,22%,27%,19%,39%,26%,24%,27%,30%,42%,25%,27%,20%,35%,23%,34%,19%,37%,35%,27%,25%,24%
Offers great food choices,26%,20%,19%,17%,67%,17%,16%,19%,16%,47%,26%,54%,16%,39%,23%,35%,12%,26%,35%,21%,20%,19%
It offers good value for money,24%,17%,19%,15%,29%,25%,19%,20%,24%,32%,31%,20%,16%,32%,15%,25%,20%,31%,29%,21%,21%,18%
Offers great desert experiences,20%,21%,20%,10%,36%,22%,22%,13%,19%,19%,24%,24%,16%,32%,13%,26%,21%,34%,8%,21%,23%,20%
Ferrari World is great to visit,35%,14%,19%,12%,16%,16%,16%,22%,20%,14%,31%,11%,16%,25%,16%,25%,20%,31%,17%,19%,23%,18%
It is affordable,14%,14%,24%,16%,20%,17%,19%,18%,17%,12%,23%,28%,14%,24%,22%,19%,19%,26%,22%,20%,22%,18%
Has beautiful mangroves,28%,8%,18%,10%,28%,16%,12%,12%,21%,4%,21%,7%,6%,25%,12%,28%,16%,34%,3%,18%,21%,17%
Has great nightlife,7%,10%,10%,4%,18%,11%,6%,9%,9%,4%,10%,7%,4%,9%,8%,11%,8%,15%,7%,12%,10%,9%`;

        const sampleTopOfMindCsv = `Attribute,Frequency
Grand Mosque,2090
Arabian traditions/culture,1846
Yas Island is amazing,1199
Great place,994
Beautiful sites/attractions,983
Luxury,932
Ferrari World,917
Modern city,830
Quiet/Peaceful city,815
Clean city,612
Great hospitality/welcoming/generous,583
Nice holiday/experience,571
Safe place,553
Beautiful city,519
Family-friendly/for all ages,499
Amazing theme parks,457
Nothing/Irrelevant,424
Beautiful tall buildings/architecture,411
Capital of UAE,374
Great infrastructure,369
Rich city,347
Extreme weather,334
Good for Business/job opportunities,323
Family residents/relatives/friends,310
Lots to do/see,288
Adventure/Fun,249
Desert experiences,243
Nice resorts/Hotels/restaurants,227
Great beaches,201
Wellbeing/Comfort,186
Warner Brothers,179
Big city,173
Very Organised,167
Developed city/innovative,135
Diversity of people/Cosmopolitan,128
Great weather,117
Formula 1,104
Museums,101
Sunshine/sun,97
Great shopping,94
Transit hub,88
The Louvre,85
Expensive,79
Malls,79
Beautiful view of the gulf/great views,77
Fast rising/growing economy,77`;

        const processor = new PerceptionRealityProcessor();
        const processedData = processor.processAllData(sampleRecommendationCsv, sampleTopOfMindCsv);
        
        // Convert to array format for validation
        window.perceptionRealityData = Object.keys(processedData.scores).map(theme => ({
            theme: theme,
            reality: processedData.scores[theme].reality,
            perception: processedData.scores[theme].perception,
            gap: processedData.scores[theme].gap
        }));
    }
});
