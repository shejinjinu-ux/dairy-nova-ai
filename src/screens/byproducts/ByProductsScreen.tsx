import React, { useState } from 'react';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { Flame, Sprout, Leaf, DollarSign, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface ByProductItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  color: string;
  shortDesc: string;
  incomePotential: string;
  dosage: string;
  processSteps: string[];
}

export const ByProductsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string>('biogas');

  const byProducts: ByProductItem[] = [
    {
      id: 'biogas',
      title: 'Biogas (Methane Fuel & Clean Energy)',
      category: 'Renewable Energy',
      icon: Flame,
      color: 'amber',
      shortDesc: 'Convert daily dung from 4-6 cattle into 2-3 cubic meters of cooking gas daily, replacing 1 LPG cylinder per month.',
      incomePotential: 'Saves ₹1,100 / month on LPG cylinders + electricity generation potential.',
      dosage: 'Daily feed: 25kg fresh cow dung + 25L water in 1:1 ratio.',
      processSteps: [
        'Collect fresh dung and mix thoroughly with water in 1:1 slurry ratio',
        'Feed into inlet chamber of 2m³ fixed dome or floating drum digester',
        'Maintain anaerobic digestion for 30-40 days retention time',
        'Direct methane gas (60% CH4) via pipe to kitchen gas stove or dual-fuel generator',
      ],
    },
    {
      id: 'vermicompost',
      title: 'Vermicompost (Black Gold Organic Fertilizer)',
      category: 'Soil Nutrition',
      icon: Sprout,
      color: 'emerald',
      shortDesc: 'Premium nutrient-rich organic manure produced using earthworms (Eisenia fetida) from decomposed dairy dung and farm waste.',
      incomePotential: 'Sells for ₹8 - ₹12 per kg in local nurseries and organic horticultural farms.',
      dosage: 'Apply 5 tonnes / acre for sugarcane, banana, vegetables, and fruit orchards.',
      processSteps: [
        'Stack cow dung and crop residues in 1-meter elevated shaded beds',
        'Pre-decompose for 15 days until internal temperature cools to 28°C',
        'Release 1,000 Eisenia fetida earthworms per square meter bed',
        'Maintain 60% moisture with regular water sprinkling',
        'Harvest granular vermicompost castings in 45-60 days by sifting through 3mm sieve',
      ],
    },
    {
      id: 'panchagavya',
      title: 'Panchagavya Organic Growth Promoter',
      category: 'Bio-Enhancer',
      icon: Leaf,
      color: 'teal',
      shortDesc: 'Traditional fermented concoction of 5 cow products (dung, urine, milk, curd, ghee) + sugarcane juice and banana for immunity and crop yield.',
      incomePotential: 'Sells at ₹150 - ₹200 per liter to organic paddy and coconut growers.',
      dosage: '3% foliar spray (300ml in 10L water) during flowering and fruit setting.',
      processSteps: [
        'Mix 7kg cow dung + 1kg cow ghee in wide-mouth plastic container; stir twice daily for 3 days',
        'Add 10L cow urine + 10L clean water on 4th day; ferment for 10 days',
        'Add 3L milk + 2L curd + 3L tender coconut water + 3kg jaggery + 12 ripe bananas on 15th day',
        'Stir morning and evening clockwise for 30 days until pleasant fruit aroma develops',
      ],
    },
    {
      id: 'slurry',
      title: 'Biogas Slurry / Jeevamrutham Liquid Manure',
      category: 'Microbial Inoculant',
      icon: DollarSign,
      color: 'blue',
      shortDesc: 'Digested bio-slurry enriched with beneficial nitrogen-fixing and phosphate-solubilizing microbes.',
      incomePotential: 'Reduces chemical NPK fertilizer expenses by up to 40%.',
      dosage: 'Apply 200L / acre along with flood or drip irrigation every 15 days.',
      processSteps: [
        'Collect digested bio-slurry overflowing from biogas plant outlet',
        'Mix 10kg cow dung + 10L cow urine + 2kg jaggery + 2kg pulse flour + handful of fertile soil in 200L water',
        'Ferment for 48-72 hours under tree shade; stir clockwise 3 times daily',
        'Apply directly to soil within 7 days of preparation for peak microbial activity',
      ],
    },
  ];

  const current = byProducts.find((b) => b.id === selectedId) || byProducts[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title={t.byProducts || 'Bio-Wealth & By-Products'} subtitle="Circular Economy & Value Addition" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
            <Sparkles size={14} /> Zero Waste Dairy Farming
          </div>
          <h3 className="font-extrabold text-sm">Monetize Dung, Urine & Bio-Slurry</h3>
          <p className="text-[11px] text-emerald-100 leading-relaxed">
            Transform animal waste into high-value organic fertilizers, cooking gas, and bio-pesticides.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="grid grid-cols-2 gap-2">
          {byProducts.map((item) => {
            const Icon = item.icon;
            const isSelected = item.id === selectedId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`p-3 min-h-[44px] rounded-2xl border text-left transition active:scale-95 flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="overflow-hidden">
                  <strong className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.title.split(' ')[0]}
                  </strong>
                  <span className="text-[10px] text-slate-400 truncate block">{item.category}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected By-Product Guide */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft space-y-3.5 text-xs animate-fadeIn">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
              {current.category}
            </span>
            <h4 className="text-base font-black text-slate-900 dark:text-white">{current.title}</h4>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed mt-1">
              {current.shortDesc}
            </p>
          </div>

          {/* Income & Dosage Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">
                💰 Value Addition
              </span>
              <p className="text-[11px] font-bold text-emerald-950 dark:text-emerald-100">
                {current.incomePotential}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-1">
              <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 block uppercase">
                🌱 Recommended Application
              </span>
              <p className="text-[11px] font-bold text-teal-950 dark:text-teal-100">
                {current.dosage}
              </p>
            </div>
          </div>

          {/* Standard Operating Procedure (SOP) */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Step-by-Step Preparation Protocol
            </h5>

            <div className="space-y-2">
              {current.processSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <BottomNavigation />
    </div>
  );
};
