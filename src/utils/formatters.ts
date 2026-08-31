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
