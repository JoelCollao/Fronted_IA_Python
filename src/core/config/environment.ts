export interface Environment {
  production: boolean;
  apiUrl: string;
  geoServerUrl: string;
  mapConfig: {
    center: [number, number];
    zoom: number;
    maxZoom: number;
    minZoom: number;
  };
}

const baseConfig = {
  mapConfig: {
    center: [40.4168, -3.7038] as [number, number], // Madrid
    zoom: 10,
    maxZoom: 18,
    minZoom: 3
  }
};

export const environments: Record<string, Environment> = {
  development: {
    production: false,
    apiUrl: 'http://localhost:3000/api',
    geoServerUrl: 'http://localhost:8080/geoserver',
    ...baseConfig
  },
  
  qa: {
    production: false,
    apiUrl: 'http://qa-api.company.com/api',
    geoServerUrl: 'http://qa-geoserver.company.com/geoserver',
    ...baseConfig
  },
  
  production: {
    production: true,
    apiUrl: 'https://api.company.com/api',
    geoServerUrl: 'https://geoserver.company.com/geoserver',
    ...baseConfig
  }
};

export const currentEnvironment: Environment = 
  environments[import.meta.env.MODE || 'development'];
