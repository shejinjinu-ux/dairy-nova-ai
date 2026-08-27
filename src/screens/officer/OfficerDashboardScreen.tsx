import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { FarmCard } from '../../components/officer/FarmCard';
import { QRScannerModal } from '../../components/common/QRScannerModal';
import { QRCodeCard } from '../../components/common/QRCodeCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SourceTag } from '../../components/common/SourceTag';
import { formatDate } from '../../utils/formatters';
import { QRBatch } from '../../types';
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  Milk,
  Search,
  ScanLine,
  Layers,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const OfficerDashboardScreen: React.FC = () => {
  const { officerFarms, contaminationAlerts, resolveContaminationAlert, navigate } = useAppData();
  const { user, setShowLogoutModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'farms' | 'contamination' | 'traceability'>('farms');
  const [searchFarm, setSearchFarm] = useState<string>('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [inspectedQRBatch, setInspectedQRBatch] = useState<QRBatch | null>(null);

  const totalCattleInUnion = officerFarms.reduce((acc, f) => acc + f.totalCattle, 0);
  const todayTotalUnionMilk = officerFarms.reduce((acc, f) => acc + f.todayMilkCollectionL, 0);
  const activeContamAlerts = contaminationAlerts.filter((c) => c.status === 'Active Alert');

  const filteredFarms = officerFarms.filter(
    (f) =>
      f.farmName.toLowerCase().includes(searchFarm.toLowerCase()) ||
      f.farmerName.toLowerCase().includes(searchFarm.toLowerCase()) ||
      f.village.toLowerCase().includes(searchFarm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* Officer Custom Header */}
      <header className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Cooperative Field Officer Mode
            </span>
            <h1 className="text-sm font-extrabold text-white truncate max-w-[190px]">
              {user?.name || 'Dr. S. Sundaram'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate('home')}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 active:scale-95 transition"
            title="Switch to Farmer Dashboard"
          >
            Farmer View
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-8 h-8 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 flex items-center justify-center active:scale-95 transition"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-5 space-y-4 pb-20 animate-fadeIn text-xs">
        
        {/* Cooperative Overview KPI Ribbon */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">Affiliated Farms</span>
            <span className="text-base font-black text-amber-400">{officerFarms.length} Units</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">Union Intake</span>
            <span className="text-base font-black text-dairy-400">{todayTotalUnionMilk.toFixed(0)} L</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-medium">Active Flags</span>
            <span className={`text-base font-black ${activeContamAlerts.length > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {activeContamAlerts.length} Alerts
            </span>
          </div>
        </div>

        {/* 3 Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-2xl font-bold">
          <button
            onClick={() => setActiveTab('farms')}
            className={`py-2 px-2 rounded-xl transition active:scale-95 text-center truncate ${
              activeTab === 'farms'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Farms ({officerFarms.length})
          </button>

          <button
            onClick={() => setActiveTab('contamination')}
            className={`py-2 px-2 rounded-xl transition active:scale-95 text-center truncate flex items-center justify-center gap-1 ${
              activeTab === 'contamination'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertTriangle size={12} className="text-rose-500" />
            Contamination
          </button>

          <button
            onClick={() => setActiveTab('traceability')}
            className={`py-2 px-2 rounded-xl transition active:scale-95 text-center truncate flex items-center justify-center gap-1 ${
              activeTab === 'traceability'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ScanLine size={12} />
            Traceability
          </button>
        </div>

        {/* Tab 1: Member Farms List */}
        {activeTab === 'farms' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchFarm}
                onChange={(e) => setSearchFarm(e.target.value)}
                placeholder="Search farms by village or farmer name..."
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500"
              />
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            </div>

            <div className="space-y-3">
              {filteredFarms.map((farm) => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  onClick={() => navigate('officer-farm-details', { farmId: farm.id })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Contamination Monitoring */}
        {activeTab === 'contamination' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-1">
              <h4 className="font-extrabold flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-rose-600" /> Cooperative Contamination Radar
              </h4>
              <p className="text-[11px] leading-relaxed">
                Screening for Aflatoxin M1, veterinary antibiotic residues, and water adulteration across chilling centers.
              </p>
            </div>

            <div className="space-y-3">
              {contaminationAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/80 shadow-card-soft space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md">
                        {alert.batchId}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                        {alert.farmName}
                      </h4>
                      <p className="text-[11px] text-slate-500">Flagged: {alert.substance} ({alert.affectedLiters} Liters)</p>
                    </div>

                    <StatusBadge status={alert.severity === 'Severe Hazard' ? 'Critical Alert' : 'Needs Attention'} size="sm" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <strong className="text-slate-800 dark:text-slate-200 block">Action Enforcement:</strong>
                    <p className="text-slate-600 dark:text-slate-400 leading-tight">{alert.actionTaken}</p>
                  </div>

                  {alert.status === 'Active Alert' && (
                    <button
                      onClick={() => resolveContaminationAlert(alert.id, 'Inspector confirmed contaminated feed batch was destroyed. Fresh milk cleared.')}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      <CheckCircle2 size={14} /> Clear Inspection Flag
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Traceability Lookup */}
        {activeTab === 'traceability' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="p-4 rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 space-y-2">
              <h4 className="font-extrabold flex items-center gap-1.5">
                <ScanLine size={16} className="text-teal-600" /> Digital Batch Verification
              </h4>
              <p className="text-[11px] leading-relaxed">
                Scan physical delivery cans or enter milk vat batch ID to verify pure origin and chilling temperature logs.
              </p>
              <button
                onClick={() => setIsQRScannerOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
              >
                <ScanLine size={14} /> Launch Inspector Scanner
              </button>
            </div>

            {inspectedQRBatch && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Inspection Audit Certificate:</h4>
                <QRCodeCard batch={inspectedQRBatch} />
              </div>
            )}
          </div>
        )}

      </main>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanned={(batch) => {
          setInspectedQRBatch(batch);
        }}
      />

    </div>
  );
};
