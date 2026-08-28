// Indian States and Major Dairy Districts Master Data
export interface StateDistricts {
  state: string;
  districts: string[];
}

export const INDIAN_STATES_DISTRICTS: StateDistricts[] = [
  {
    state: 'Tamil Nadu',
    districts: [
      'Erode',
      'Salem',
      'Coimbatore',
      'Tiruppur',
      'Namakkal',
      'Dharmapuri',
      'Krishnagiri',
      'Dindigul',
      'Madurai',
      'Theni',
      'Virudhunagar',
      'Tirunelveli',
      'Thoothukudi',
      'Tenkasi',
      'Thanjavur',
      'Tiruvarur',
      'Nagapattinam',
      'Mayiladuthurai',
      'Cuddalore',
      'Villupuram',
      'Kallakurichi',
      'Tiruvannamalai',
      'Vellore',
      'Ranipet',
      'Tirupathur',
      'Kanchipuram',
      'Chengalpattu',
      'Tiruvallur',
      'Chennai',
      'Pudukkottai',
      'Ariyalur',
      'Perambalur',
      'Karur',
      'Tiruchirappalli',
      'Sivaganga',
      'Ramanathapuram',
      'Kanniyakumari',
      'Nilgiris',
    ],
  },
  {
    state: 'Andhra Pradesh',
    districts: [
      'Chittoor',
      'Tirupati',
      'Anantapur',
      'Sri Sathya Sai',
      'Kadapa',
      'Kurnool',
      'Nandyal',
      'Nellore',
      'Prakasam',
      'Guntur',
      'Bapatla',
      'Palnadu',
      'Krishna',
      'NTR',
      'West Godavari',
      'Eluru',
      'East Godavari',
      'Kakinada',
      'Dr. B.R. Ambedkar Konaseema',
      'Visakhapatnam',
      'Anakapalli',
      'Vizianagaram',
      'Srikakulam',
    ],
  },
  {
    state: 'Karnataka',
    districts: [
      'Bengaluru Urban',
      'Bengaluru Rural',
      'Mandya',
      'Mysuru',
      'Hassan',
      'Tumakuru',
      'Kolar',
      'Chikkaballapur',
      'Ramanagara',
      'Belagavi',
      'Dharwad',
      'Ballari',
      'Vijayapura',
      'Bagalkote',
      'Shivamogga',
      'Davangere',
      'Chitradurga',
      'Dakshina Kannada',
      'Udupi',
      'Uttara Kannada',
    ],
  },
  {
    state: 'Kerala',
    districts: [
      'Wayanad',
      'Palakkad',
      'Thrissur',
      'Ernakulam',
      'Idukki',
      'Kottayam',
      'Alappuzha',
      'Pathanamthitta',
      'Kollam',
      'Thiruvananthapuram',
      'Malappuram',
      'Kozhikode',
      'Kannur',
      'Kasaragod',
    ],
  },
  {
    state: 'Maharashtra',
    districts: [
      'Pune',
      'Kolhapur',
      'Sangli',
      'Satara',
      'Ahmednagar',
      'Nashik',
      'Solapur',
      'Aurangabad (Chhatrapati Sambhajinagar)',
      'Jalgaon',
      'Nagpur',
      'Amravati',
      'Latur',
      'Osmanabad (Dharashiv)',
      'Nanded',
      'Bhandara',
      'Wardha',
    ],
  },
  {
    state: 'Gujarat',
    districts: [
      'Anand',
      'Mehsana',
      'Banaskantha',
      'Sabarkantha',
      'Kheda',
      'Surat',
      'Vadodara',
      'Rajkot',
      'Junagadh',
      'Bhavnagar',
      'Amreli',
      'Patan',
      'Gandhinagar',
      'Ahmedabad',
      'Kutch',
      'Bharuch',
    ],
  },
  {
    state: 'Punjab',
    districts: [
      'Ludhiana',
      'Amritsar',
      'Jalandhar',
      'Patiala',
      'Bathinda',
      'Sangrur',
      'Hoshiarpur',
      'Gurdaspur',
      'Moga',
      'Firozpur',
      'Faridkot',
      'Fatehgarh Sahib',
      'Rupnagar',
    ],
  },
  {
    state: 'Haryana',
    districts: [
      'Rohtak',
      'Hisar',
      'Karnal',
      'Jind',
      'Sirsa',
      'Sonipat',
      'Ambala',
      'Kurukshetra',
      'Bhiwani',
      'Fatehabad',
      'Yamunanagar',
      'Panipat',
      'Gurugram',
      'Faridabad',
    ],
  },
  {
    state: 'Rajasthan',
    districts: [
      'Jaipur',
      'Alwar',
      'Bikaner',
      'Jodhpur',
      'Udaipur',
      'Ajmer',
      'Kota',
      'Sikar',
      'Nagaur',
      'Churu',
      'Sri Ganganagar',
      'Hanumangarh',
      'Bharatpur',
      'Bhilwara',
    ],
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      'Agra',
      'Aligarh',
      'Mathura',
      'Meerut',
      'Muzaffarnagar',
      'Bulandshahr',
      'Bareilly',
      'Moradabad',
      'Lucknow',
      'Kanpur',
      'Varanasi',
      'Prayagraj',
      'Gorakhpur',
      'Jhansi',
      'Ayodhya',
      'Etawah',
    ],
  },
  {
    state: 'Telangana',
    districts: [
      'Hyderabad',
      'Rangareddy',
      'Medchal-Malkajgiri',
      'Sangareddy',
      'Siddipet',
      'Karimnagar',
      'Warangal',
      'Nalgonda',
      'Khammam',
      'Nizamabad',
      'Mahabubnagar',
    ],
  },
  {
    state: 'Madhya Pradesh',
    districts: [
      'Indore',
      'Bhopal',
      'Ujjain',
      'Gwalior',
      'Jabalpur',
      'Sagar',
      'Dewas',
      'Ratlam',
      'Mandsaur',
      'Hoshangabad (Narmadapuram)',
      'Khargone',
      'Khandwa',
    ],
  },
  {
    state: 'Bihar',
    districts: [
      'Patna',
      'Gaya',
      'Muzaffarpur',
      'Bhagalpur',
      'Darbhanga',
      'Purnia',
      'Samastipur',
      'Begusarai',
      'Nalanda',
      'Rohtas',
      'Vaishali',
    ],
  },
  {
    state: 'West Bengal',
    districts: [
      'Kolkata',
      'North 24 Parganas',
      'South 24 Parganas',
      'Hooghly',
      'Howrah',
      'Nadia',
      'Murshidabad',
      'Bardhaman',
      'Bankura',
      'Paschim Medinipur',
    ],
  },
  {
    state: 'Odisha',
    districts: [
      'Cuttack',
      'Khurda (Bhubaneswar)',
      'Puri',
      'Balasore',
      'Ganjam',
      'Sambalpur',
      'Bhadrak',
      'Mayurbhanj',
      'Bargarh',
      'Jajpur',
    ],
  },
  {
    state: 'Assam',
    districts: [
      'Kamrup (Guwahati)',
      'Nagaon',
      'Sonitpur',
      'Cachar',
      'Dibrugarh',
      'Jorhat',
      'Barpeta',
      'Darrang',
      'Dhubri',
    ],
  },
];

export const INDIAN_STATES: string[] = INDIAN_STATES_DISTRICTS.map((s) => s.state);

export const INDIAN_DISTRICTS_BY_STATE: Record<string, string[]> = INDIAN_STATES_DISTRICTS.reduce(
  (acc, curr) => {
    acc[curr.state] = curr.districts;
    return acc;
  },
  {} as Record<string, string[]>
);

export interface FarmerLocationResult {
  success: boolean;
  locationString?: string;
  state?: string;
  district?: string;
  village?: string;
  error?: string;
}

/**
 * Use HTML5 Geolocation to detect device GPS coordinates and reverse-geocode into Indian state & district.
 */
export async function detectCurrentFarmerLocation(): Promise<FarmerLocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      success: false,
      error: 'Geolocation is not supported by your device or browser.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Attempt lightweight reverse geocoding via public openstreetmap / nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'DairyNovaAI/1.0' } }
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            const state = address.state || address.province || '';
            const district =
              address.state_district ||
              address.county ||
              address.district ||
              address.city ||
              address.town ||
              '';
            const village = address.village || address.suburb || address.neighbourhood || '';

            let locParts = [];
            if (village) locParts.push(village);
            if (district) locParts.push(district);
            if (state) locParts.push(state);

            const locationString =
              locParts.length > 0 ? locParts.join(', ') : `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`;

            resolve({
              success: true,
              locationString,
              state,
              district,
              village,
            });
            return;
          }
        } catch {
          // Reverse geocoding network failure fallback
        }

        // Fallback with coordinates
        resolve({
          success: true,
          locationString: `Lat ${latitude.toFixed(3)}, Long ${longitude.toFixed(3)} (India)`,
        });
      },
      (geoError) => {
        let message = 'Location permission was denied. Please select your State & District manually.';
        if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message = 'Location information is currently unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          message = 'Location request timed out. Please try again or select manually.';
        }
        resolve({
          success: false,
          error: message,
        });
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      }
    );
  });
}
