import { Country } from '../data/countries';
import { ApiConfig } from '../types/badge';

/**
 * Service to execute custom user-defined APIs for fetching custom flag graphics,
 * dynamic seal designs, or automated metadata.
 */

export interface ApiResponseResult {
  success: boolean;
  imageUrl?: string;
  imageBlob?: Blob;
  statusText?: string;
  rawJson?: any;
  error?: string;
}

/**
 * Executes a custom API call for a given country
 */
export async function executeCustomApi(
  config: ApiConfig,
  country: Country
): Promise<ApiResponseResult> {
  if (!config.endpointUrl || !config.endpointUrl.trim()) {
    return { success: false, error: 'Endpoint URL is empty' };
  }

  // Replace placeholders like {code}, {code_lower}, {country}, {name}
  let finalUrl = config.endpointUrl;
  finalUrl = finalUrl.replace(/\{code\}/gi, country.code);
  finalUrl = finalUrl.replace(/\{code_lower\}/gi, country.code.toLowerCase());
  finalUrl = finalUrl.replace(/\{country\}/gi, encodeURIComponent(country.name));
  finalUrl = finalUrl.replace(/\{name\}/gi, encodeURIComponent(country.name));
  finalUrl = finalUrl.replace(/\{short\}/gi, encodeURIComponent(country.shortName));

  const headers: Record<string, string> = {
    Accept: 'application/json, image/*, */*',
  };

  if (config.apiKey && config.apiKey.trim()) {
    const headerKey = config.headerName?.trim() || 'Authorization';
    headers[headerKey] = config.apiKey.startsWith('Bearer ') || headerKey.toLowerCase() !== 'authorization'
      ? config.apiKey.trim()
      : `Bearer ${config.apiKey.trim()}`;
  }

  try {
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return {
        success: false,
        statusText: `HTTP ${response.status}: ${response.statusText}`,
        error: `Request failed with HTTP status ${response.status}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';

    // If direct image returned
    if (contentType.includes('image/') || config.responseMapping === 'direct_image') {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      return {
        success: true,
        imageUrl: objectUrl,
        imageBlob: blob,
        statusText: 'Image received successfully',
      };
    }

    // Otherwise JSON response
    const json = await response.json();

    // Resolve JSON path (e.g. "image_url" or "data.flag_url")
    let imageUrl: string | undefined;
    if (config.jsonPath && config.jsonPath.trim()) {
      const parts = config.jsonPath.trim().split('.');
      let current: any = json;
      for (const p of parts) {
        if (current && typeof current === 'object' && p in current) {
          current = current[p];
        } else {
          current = undefined;
          break;
        }
      }
      if (typeof current === 'string') {
        imageUrl = current;
      }
    } else {
      // Auto-detect common keys
      const candidateKeys = ['url', 'imageUrl', 'image_url', 'flag', 'flag_url', 'seal_url', 'src', 'data'];
      for (const k of candidateKeys) {
        if (json && typeof json[k] === 'string' && json[k].startsWith('http')) {
          imageUrl = json[k];
          break;
        }
      }
    }

    return {
      success: true,
      imageUrl,
      rawJson: json,
      statusText: imageUrl ? 'Extracted image from API response' : 'Received JSON response',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error occurred while calling custom API',
    };
  }
}
