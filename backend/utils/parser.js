/**
 * Parser utilities for test case files
 * Supports multiple formats from CPU scheduling repos
 */

/**
 * Parse standard format: "id arrivalTime burstTime [priority]"
 * Each process on a new line
 */
export const parseStandardFormat = (content) => {
  const lines = content.trim().split('\n').filter(line => line.trim());
  const processes = [];

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.startsWith('//')) continue;

    const parts = line.trim().split(/[\s,;|]+/).filter(Boolean);
    
    if (parts.length >= 3) {
      processes.push({
        id: parts[0],
        arrivalTime: parseInt(parts[1], 10),
        burstTime: parseInt(parts[2], 10),
        priority: parts[3] ? parseInt(parts[3], 10) : 0
      });
    }
  }

  return processes;
};

/**
 * Parse CSV format with headers
 * id,arrivalTime,burstTime,priority
 */
export const parseCSVFormat = (content) => {
  const lines = content.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const processes = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const process = {};

    headers.forEach((header, index) => {
      if (header.includes('id') || header.includes('name') || header.includes('process')) {
        process.id = values[index];
      } else if (header.includes('arrival')) {
        process.arrivalTime = parseInt(values[index], 10);
      } else if (header.includes('burst') || header.includes('execution') || header.includes('cpu')) {
        process.burstTime = parseInt(values[index], 10);
      } else if (header.includes('priority')) {
        process.priority = parseInt(values[index], 10);
      }
    });

    if (process.id && !isNaN(process.arrivalTime) && !isNaN(process.burstTime)) {
      process.priority = process.priority || 0;
      processes.push(process);
    }
  }

  return processes;
};

/**
 * Parse JSON format
 */
export const parseJSONFormat = (content) => {
  try {
    const data = JSON.parse(content);
    
    // Handle array of processes
    if (Array.isArray(data)) {
      return data.map((p, index) => ({
        id: p.id || p.name || `P${index + 1}`,
        arrivalTime: parseInt(p.arrivalTime ?? p.arrival ?? 0, 10),
        burstTime: parseInt(p.burstTime ?? p.burst ?? p.executionTime ?? 1, 10),
        priority: parseInt(p.priority ?? 0, 10)
      }));
    }
    
    // Handle object with processes array
    if (data.processes && Array.isArray(data.processes)) {
      return data.processes.map((p, index) => ({
        id: p.id || p.name || `P${index + 1}`,
        arrivalTime: parseInt(p.arrivalTime ?? p.arrival ?? 0, 10),
        burstTime: parseInt(p.burstTime ?? p.burst ?? p.executionTime ?? 1, 10),
        priority: parseInt(p.priority ?? 0, 10)
      }));
    }

    return [];
  } catch (e) {
    throw new Error(`Invalid JSON format: ${e.message}`);
  }
};

/**
 * Parse C++ repo format (from referenced GitHub repo)
 * Format: First line is number of processes, then each process details
 */
export const parseCppRepoFormat = (content) => {
  const lines = content.trim().split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  if (lines.length === 0) return [];

  const firstLine = lines[0].trim().split(/\s+/);
  
  // Check if first line is just a number (process count)
  if (firstLine.length === 1 && !isNaN(parseInt(firstLine[0], 10))) {
    const processCount = parseInt(firstLine[0], 10);
    const processes = [];
    
    for (let i = 1; i <= processCount && i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 2) {
        processes.push({
          id: `P${i}`,
          arrivalTime: parseInt(parts[0], 10),
          burstTime: parseInt(parts[1], 10),
          priority: parts[2] ? parseInt(parts[2], 10) : 0
        });
      }
    }
    
    return processes;
  }

  // Fall back to standard format
  return parseStandardFormat(content);
};

/**
 * Auto-detect format and parse
 */
export const parseTestCase = (content, filename = '') => {
  const trimmedContent = content.trim();

  // Detect JSON
  if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
    return parseJSONFormat(trimmedContent);
  }

  // Detect CSV (by filename or header row)
  if (filename.endsWith('.csv') || trimmedContent.split('\n')[0].includes(',')) {
    const firstLine = trimmedContent.split('\n')[0].toLowerCase();
    if (firstLine.includes('id') || firstLine.includes('arrival') || firstLine.includes('burst')) {
      return parseCSVFormat(trimmedContent);
    }
  }

  // Try C++ repo format first
  const cppResult = parseCppRepoFormat(trimmedContent);
  if (cppResult.length > 0) {
    return cppResult;
  }

  // Fall back to standard format
  return parseStandardFormat(trimmedContent);
};

/**
 * Validate parsed processes
 */
export const validateProcesses = (processes) => {
  const errors = [];

  if (!Array.isArray(processes) || processes.length === 0) {
    errors.push('No valid processes found');
    return { valid: false, errors };
  }

  const ids = new Set();

  processes.forEach((p, index) => {
    if (!p.id) {
      errors.push(`Process ${index + 1}: Missing id`);
    } else if (ids.has(p.id)) {
      errors.push(`Process ${index + 1}: Duplicate id '${p.id}'`);
    } else {
      ids.add(p.id);
    }

    if (isNaN(p.arrivalTime) || p.arrivalTime < 0) {
      errors.push(`Process ${p.id || index + 1}: Invalid arrival time`);
    }

    if (isNaN(p.burstTime) || p.burstTime <= 0) {
      errors.push(`Process ${p.id || index + 1}: Invalid burst time (must be > 0)`);
    }

    if (p.priority !== undefined && isNaN(p.priority)) {
      errors.push(`Process ${p.id || index + 1}: Invalid priority`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    processCount: processes.length
  };
};

export default {
  parseTestCase,
  parseStandardFormat,
  parseCSVFormat,
  parseJSONFormat,
  parseCppRepoFormat,
  validateProcesses
};