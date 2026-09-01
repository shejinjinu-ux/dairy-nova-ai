export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatTime = (timeStr: string): string => {
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timeStr;
  }
};

export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const getGreetingTime = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export interface AnimalAgeInput {
  ageYears?: number;
  ageMonths?: number;
  dateOfBirth?: string;
  lactationStage?: string;
}

export const formatAnimalAge = (animal: AnimalAgeInput, includePrefix: boolean = false): string => {
  let years = animal.ageYears;

  if (animal.dateOfBirth) {
    try {
      const birth = new Date(animal.dateOfBirth);
      const now = new Date();
      const diffYears = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      years = monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate()) ? diffYears - 1 : diffYears;
    } catch {
      // fallback to ageYears
    }
  }

  if (animal.lactationStage === 'Calf' || (years === 0 && (!animal.ageMonths || animal.ageMonths === 0)) || (years !== undefined && years <= 0)) {
    return includePrefix ? 'Age: Calf' : 'Calf';
  }

  const y = Math.max(1, years || 1);
  const label = `${y} ${y === 1 ? 'year' : 'years'}`;
  return includePrefix ? `Age: ${label}` : label;
};

export interface AnimalLactationInput {
  sex?: string;
  lactationStage?: string;
  calvingDate?: string;
  lactationStartDate?: string;
  daysInMilk?: number;
}

export interface LactationDisplayInfo {
  statusText: string;
  stageBadge: string;
  dimText: string;
  isLactating: boolean;
  dimValue: number | null;
}

export const getLactationDisplay = (animal: AnimalLactationInput): LactationDisplayInfo => {
  if (animal.sex === 'Male') {
    return {
      statusText: 'Not applicable',
      stageBadge: 'Not applicable',
      dimText: '—',
      isLactating: false,
      dimValue: null,
    };
  }

  if (animal.lactationStage === 'Calf') {
    return {
      statusText: 'Not yet lactating',
      stageBadge: 'Calf',
      dimText: '—',
      isLactating: false,
      dimValue: null,
    };
  }

  if (animal.lactationStage === 'Heifer' || (!animal.calvingDate && !animal.lactationStartDate && animal.daysInMilk === undefined)) {
    return {
      statusText: 'Not yet lactating',
      stageBadge: animal.lactationStage || 'Not yet lactating',
      dimText: '—',
      isLactating: false,
      dimValue: null,
    };
  }

  // Calculate DIM
  let dim = animal.daysInMilk;
  const startDate = animal.calvingDate || animal.lactationStartDate;
  if (dim === undefined && startDate) {
    try {
      const diffMs = new Date().getTime() - new Date(startDate).getTime();
      dim = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    } catch {
      dim = undefined;
    }
  }

  if (animal.lactationStage === 'Dry') {
    return {
      statusText: 'Dry Period',
      stageBadge: 'Dry',
      dimText: dim !== undefined ? `${dim}d` : '—',
      isLactating: false,
      dimValue: dim ?? null,
    };
  }

  if (dim !== undefined) {
    let stage = animal.lactationStage || 'Early';
    if (dim <= 100) stage = 'Early';
    else if (dim <= 200) stage = 'Mid';
    else if (dim <= 305) stage = 'Late';
    else stage = 'Dry';

    return {
      statusText: `${stage} Lactation (${dim}d)`,
      stageBadge: stage,
      dimText: `${dim}d`,
      isLactating: stage !== 'Dry',
      dimValue: dim,
    };
  }

  return {
    statusText: animal.lactationStage || 'Active',
    stageBadge: animal.lactationStage || 'Active',
    dimText: '—',
    isLactating: true,
    dimValue: null,
  };
};

export interface MilkEligibilityResult {
  isEligible: boolean;
  reason?: string;
  lactationInfo: LactationDisplayInfo;
}

export const checkMilkEligibility = (animal?: {
  tagId?: string;
  name?: string;
  sex?: string;
  lactationStage?: string;
  calvingDate?: string;
  lactationStartDate?: string;
  daysInMilk?: number;
  dateOfBirth?: string;
  ageYears?: number;
  ageMonths?: number;
  parity?: number;
} | null): MilkEligibilityResult => {
  if (!animal) {
    return {
      isEligible: false,
      reason: 'No cattle record selected. Please select a valid cattle from your herd.',
      lactationInfo: {
        statusText: 'Unknown',
        stageBadge: 'Unknown',
        dimText: '—',
        isLactating: false,
        dimValue: null,
      },
    };
  }

  // 1. Tag ID check
  if (!animal.tagId || !animal.tagId.trim()) {
    return {
      isEligible: false,
      reason: 'Milk recording is not available because this cattle has no valid Tag ID.',
      lactationInfo: {
        statusText: 'Missing Tag ID',
        stageBadge: 'Invalid',
        dimText: '—',
        isLactating: false,
        dimValue: null,
      },
    };
  }

  // 2. Sex Check: Male cattle are never eligible
  if (animal.sex === 'Male') {
    return {
      isEligible: false,
      reason: 'Milk recording is not available for this animal because it is male.',
      lactationInfo: {
        statusText: 'Not applicable',
        stageBadge: 'Not applicable',
        dimText: '—',
        isLactating: false,
        dimValue: null,
      },
    };
  }

  // 3. Calf Check (Age <= 12 months or lactationStage === 'Calf')
  let isCalf = animal.lactationStage === 'Calf';
  if (animal.dateOfBirth) {
    try {
      const birth = new Date(animal.dateOfBirth);
      const now = new Date();
      if (!isNaN(birth.getTime())) {
        const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (diffMonths <= 12) isCalf = true;
      }
    } catch {}
  }
  if (isCalf) {
    return {
      isEligible: false,
      reason: 'Milk recording is not available because this animal is a calf and has not started lactation.',
      lactationInfo: {
        statusText: 'Not yet lactating',
        stageBadge: 'Calf',
        dimText: '—',
        isLactating: false,
        dimValue: null,
      },
    };
  }

  // 4. Calving History Check (has the animal calved before?)
  const calvingDateStr = animal.calvingDate;
  if (!calvingDateStr || animal.lactationStage === 'Heifer' || (animal.parity !== undefined && animal.parity <= 0)) {
    return {
      isEligible: false,
      reason: 'Milk recording is not available because this animal has not calved yet.',
      lactationInfo: {
        statusText: 'Not yet lactating',
        stageBadge: 'Heifer',
        dimText: '—',
        isLactating: false,
        dimValue: null,
      },
    };
  }

  // 5. Validate Calving Date
  const calvingDateObj = new Date(calvingDateStr);
  const today = new Date();
  if (isNaN(calvingDateObj.getTime())) {
    return {
      isEligible: false,
      reason: 'Milk recording is not available because the recorded calving date is invalid. Please update the cattle record with a valid calving date.',
      lactationInfo: {
        statusText: 'Invalid Calving Date',
        stageBadge: 'Invalid',
        dimText: '—',
        isLactating: false,
        dimValue: null,
      },
    };
  }

  if (calvingDateObj.getTime() > today.getTime()) {
    return {
      isEligible: false,
      reason: 'Milk recording is not available because the recorded calving date is in the future. Please update with the actual past calving date.',
      lactationInfo: {
        statusText: 'Future Calving Date',
        stageBadge: 'Invalid',
        dimText: '—',
        isLactating: false,
        dimValue: null,
      },
    };
  }

  // 6. Calculate real-time DIM strictly from latest valid calving date
  const diffMs = today.getTime() - calvingDateObj.getTime();
  const dim = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // 7. Dry Period Check: If Stage is Dry or DIM > 305 days
  if (animal.lactationStage === 'Dry' || dim > 305) {
    return {
      isEligible: false,
      reason: 'Milk recording is currently unavailable because this cow is in the dry period.',
      lactationInfo: {
        statusText: `Dry Period (${dim}d)`,
        stageBadge: 'Dry',
        dimText: `${dim}d`,
        isLactating: false,
        dimValue: dim,
      },
    };
  }

  // 8. Active Lactation (Early <=100d, Mid <=200d, Late <=305d)
  let stage = 'Early';
  if (dim <= 100) stage = 'Early';
  else if (dim <= 200) stage = 'Mid';
  else if (dim <= 305) stage = 'Late';

  return {
    isEligible: true,
    lactationInfo: {
      statusText: `${stage} Lactation (${dim}d)`,
      stageBadge: stage,
      dimText: `${dim}d`,
      isLactating: true,
      dimValue: dim,
    },
  };
};
