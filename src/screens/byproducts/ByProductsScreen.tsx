import React, { useState } from 'react';
import { MobileHeader } from '../../components/common/MobileHeader';
import { BottomNavigation } from '../../components/common/BottomNavigation';
import { Flame, Sprout, Leaf, DollarSign, CheckCircle2, ChevronRight, X, LucideIcon } from 'lucide-react';

interface ByProductItem {
  id: string;
  title: string;
  category: string;
  icon: LucideIcon;
  color: string;
  shortDesc: string;
  incomePotential: string;
  dosage: string;
  processSteps: string[];
}

export const ByProductsScreen: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<ByProductItem | null>(null);

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
        'Collect digested overflow liquid from biogas plant outlet tank',
        'Add 1kg jaggery + 1kg pulse flour (besan) + handful of virgin farm soil',
        'Ferment in shade for 48 hours to multiply active microbial population',
        'Filter through fine nylon cloth and pump into drip irrigation system',
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader showBack={true} title="By-Products Monetization" subtitle="Zero-Waste Dairy Economy" />

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn">
        
        {/* Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white border border-emerald-700/50 shadow-md space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            Circular Dairy Economy
          </span>
          <h3 className="text-base font-extrabold">Turn Cattle Dung & Urine into Profits</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            A single dairy cow yields ₹15,000 to ₹25,000 per year in secondary by-product value beyond milk.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {byProducts.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card-soft hover:shadow-card-hover cursor-pointer active:scale-[0.98] transition space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400 block">
                      {item.category}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.shortDesc}
                </p>

                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-600 shrink-0" />
                  <span>{item.incomePotential}</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-400 font-bold">
                  <span>View Step-by-Step Preparation Guide</span>
                  <ChevronRight size={15} />
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <BottomNavigation />

      {/* Preparation Guide Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {selectedProduct.title}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <strong className="block mb-0.5">Dosage / Recommended Ratio:</strong>
                <span>{selectedProduct.dosage}</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Step-by-Step Method:</h4>
                <ol className="space-y-2 list-decimal list-inside text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedProduct.processSteps.map((step, idx) => (
                    <li key={idx} className="text-[11px] pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                <strong className="block mb-0.5 text-slate-900 dark:text-white">Economic Value:</strong>
                <span>{selectedProduct.incomePotential}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedProduct(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs active:scale-95 transition"
            >
              Close Guide
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
