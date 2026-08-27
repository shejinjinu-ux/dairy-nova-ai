import { HealthAlert, FeedAnalysisResult, SilageAnalysisResult, Animal } from '../types';

export const SIMULATED_DISEASE_DIAGNOSTICS = [
  {
    keywords: ['mastitis', 'udder', 'swelling', 'clot', 'watery milk', 'fever', 'teat'],
    result: {
      possibleConcern: 'Early Stage Subclinical Mastitis',
      severity: 'high' as const,
      confidenceScore: 89,
      preliminaryGuidance: 'High probability of intramammary bacterial proliferation. Isolate cow during milking. Disinfect teat with 0.5% povidone-iodine dip immediately.',
      veterinaryAdvice: 'Contact your registered veterinarian for California Mastitis Test (CMT) verification and appropriate antibiotic sensitivity protocol.',
      symptomsDetected: ['Udder quarter inflammation', 'Watery/flaky secretion', 'Elevated somatic cell count indication'],
      preventionTips: [
        'Ensure clean dry bedding with lime powder dusting',
        'Avoid leaving teat cups under vacuum after milk flow stops',
        'Milking person must wash hands with warm antiseptic water before milking each cow',
      ],
    },
  },
  {
    keywords: ['lumpy', 'skin', 'nodule', 'lesion', 'pox', 'lumpy skin'],
    result: {
      possibleConcern: 'Possible Lumpy Skin Disease (LSD) Symptoms',
      severity: 'critical' as const,
      confidenceScore: 91,
      preliminaryGuidance: 'Visible cutaneous nodules detected. Immediately isolate the animal in a well-ventilated, mosquito/fly-netted shed.',
      veterinaryAdvice: 'Report to your local Government Veterinary Dispensary / Animal Husbandry Officer immediately for ring vaccination and symptomatic supportive therapy.',
      symptomsDetected: ['Circumscribed firm skin nodules (2-5cm)', 'High pyrexia (fever)', 'Ocular & nasal discharge'],
      preventionTips: [
        'Spray insect repellents (Neem oil / deltamethrin) to eliminate vector flies and mosquitoes',
        'Quarantine newly purchased animals for 28 days',
        'Vaccinate remaining herd with Goat Pox Vaccine as per veterinary guidelines',
      ],
    },
  },
  {
    keywords: ['foot', 'mouth', 'blister', 'saliva', 'drooling', 'limp', 'fmd', 'hoof'],
    result: {
      possibleConcern: 'Possible Foot and Mouth Disease (FMD) Screening',
      severity: 'critical' as const,
      confidenceScore: 94,
      preliminaryGuidance: 'Excessive ropy salivation and interdigital hoof lesions observed. Highly contagious viral condition.',
      veterinaryAdvice: 'Quarantine entire farm premises. Wash mouth lesions with 1% potassium permanganate solution and foot lesions with 2% sodium carbonate or 4% soda ash. Contact vet urgently.',
      symptomsDetected: ['Profuse ropey salivation', 'Interdigital hoof ulcers / blisters', 'Sudden milk yield drop to near zero'],
      preventionTips: [
        'Do not allow entry of outside vehicles or visitors',
        'Biannual vaccination with trivalent FMD vaccine is mandatory',
        'Provide soft gruel (cooked broken rice/ragi) as rough fodder causes pain',
      ],
    },
  },
  {
    keywords: ['heat', 'estrus', 'bellowing', 'discharge', 'mounting', 'ai', 'breeding'],
    result: {
      possibleConcern: 'Estrus (Standing Heat) State Detected',
      severity: 'low' as const,
      confidenceScore: 96,
      preliminaryGuidance: 'Animal is displaying peak reproductive receptivity. Optimal window for Artificial Insemination (AI).',
      veterinaryAdvice: 'Follow the standard AM-PM rule: If heat is first observed in morning, inseminate in evening; if observed in evening, inseminate next morning.',
      symptomsDetected: ['Clear stringy mucous discharge', 'Frequent restlessness and mounting behavior', 'Vulval hyperemia'],
      preventionTips: [
        'Ensure frozen semen straw is thawed at 37°C for 30 seconds by certified AI technician',
        'Provide shade and avoid heat stress post-insemination',
        'Supply 50g chelated mineral mixture daily to boost conception rate',
      ],
    },
  },
  {
    keywords: ['indigestion', 'bloat', 'rumen', 'gas', 'swollen left', 'dung', 'loose'],
    result: {
      possibleConcern: 'Ruminal Tympany (Bloat) / Simple Indigestion',
      severity: 'medium' as const,
      confidenceScore: 86,
      preliminaryGuidance: 'Distended left paralumbar fossa with gas accumulation. Withhold lush green legumes immediately.',
      veterinaryAdvice: 'Drench with 500ml sweet oil (gingelly/mustard oil) mixed with 50ml turpentine oil. If respiratory distress occurs, veterinary trocarization is required urgently.',
      symptomsDetected: ['Left flank distension (tight like a drum)', 'Frequent kicking at abdomen', 'Shallow rapid breathing'],
      preventionTips: [
        'Never feed young wet legume fodder (Lucerne/Berseem) on an empty stomach',
        'Always provide dry straw before feeding lush greens',
        'Introduce new silage batches gradually over 7 days',
      ],
    },
  },
];

export const AI_CHAT_RESPONSES = [
  {
    match: (q: string) => q.includes('health') || q.includes('check') || q.includes('fever') || q.includes('sick'),
    response: `Based on your herd telemetry, 10 out of 12 animals are in prime health. However:
1. **TAG-106 (Daisy)** has a Critical Alert with 40.2°C temperature and mastitis signs.
2. **TAG-103 (Kaali)** requires udder monitoring before evening milking.
3. **TAG-110 (Yamuna)** is in active estrus (standing heat) and ready for Artificial Insemination.

*Disclaimer: Dairy Nova AI provides preliminary screening only. Always consult your veterinary surgeon for diagnosis.*`,
  },
  {
    match: (q: string) => q.includes('vaccin') || q.includes('due') || q.includes('schedule'),
    response: `Here is your herd's vaccination priority:
• **Overdue:** TAG-106 Daisy (Black Quarter - BQ, overdue 7 days)
• **Due Today:** TAG-104 Padma (Hemorrhagic Septicemia - HS)
• **Upcoming (30 Aug):** TAG-101 Gouri (Foot & Mouth Disease - FMD booster)

Would you like me to schedule a visit reminder for your local veterinary livestock inspector?`,
  },
  {
    match: (q: string) => q.includes('feed') || q.includes('fodder') || q.includes('nutrition') || q.includes('ration'),
    response: `Your latest feed screening results:
• **Super Napier CO-5 (Batch A1):** Score 88/100 (Grade A+ Premium). Excellent 12.4% protein.
• **Paddy Straw (Batch C3):** Score 54/100 (Grade B). **Warning:** 17.8% moisture with mild fungal spores. Please sun-dry for 4 hours before feeding.

Recommended daily ration per high-yield cow: 25kg chopped Super Napier + 4kg dry paddy straw + 4kg 22% protein cattle pellets + 50g mineral mix.`,
  },
  {
    match: (q: string) => q.includes('silage') || q.includes('pit') || q.includes('ferment') || q.includes('ph'),
    response: `Your **Corn Silage Pit M01** IoT sensors report:
• **pH Level:** 3.85 (Optimal Lactic Fermentation range: 3.8 - 4.2)
• **Moisture:** 66.4% (Ideal moisture for cattle)
• **Internal Temp:** 26.2°C (Stable seal, no secondary aerobic heating)

The silage is safe and certified premium quality for high-lactation feeding.`,
  },
  {
    match: (q: string) => q.includes('milk') || q.includes('decreas') || q.includes('yield') || q.includes('fat'),
    response: `Today's total herd collection is **154.2 Liters** (Morning: 82.5 L, Evening: 71.7 L) with an average fat of **5.2%** and SNF **8.85%**.

Key observation: **TAG-106 (Daisy)** experienced a 6.2L yield decline due to acute mastitis symptoms. Treating her promptly will restore peak yield within 5 to 7 days.`,
  },
  {
    match: (q: string) => q.includes('breed') || q.includes('gir') || q.includes('murrah') || q.includes('sahiwal'),
    response: `Dairy Nova AI maintains full profiles for indigenous & crossbred dairy cattle:
• **Gir & Sahiwal:** Native A2 milk producers, superior tick resistance, requires 25kg green fodder daily.
• **Murrah Buffalo:** "Black Gold" of Indian dairy, produces 7.5% - 8.5% fat milk, requires water wallowing.
• **HF & Jersey Cross:** High volumetric yielders (20-30L/day), requires active shed cooling above 30°C.`,
  },
];
