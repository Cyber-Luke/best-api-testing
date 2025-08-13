/**
 * Coverage tracking for GraphQL operations
 */

const registeredOperations = new Set<string>();
const usedOperations = new Set<string>();

export function registerOperation(name: string): void {
  registeredOperations.add(name);
}

export function markUsed(name: string): void {
  usedOperations.add(name);
}

export interface CoverageReport {
  total: number;
  covered: number;
  percent: number;
  operations: {
    registered: string[];
    used: string[];
    unused: string[];
  };
}

function calcPercent(total: number, covered: number): number {
  if (total === 0) return 0; // previously 100 – misleading when nothing registered
  return (covered / total) * 100;
}

export function getCoverage(): CoverageReport {
  const total = registeredOperations.size;
  const covered = usedOperations.size;
  const percent = calcPercent(total, covered);

  return {
    total,
    covered,
    percent,
    operations: {
      registered: Array.from(registeredOperations).sort(),
      used: Array.from(usedOperations).sort(),
      unused: Array.from(registeredOperations)
        .filter((op) => !usedOperations.has(op))
        .sort(),
    },
  };
}

export function getCoverageByPrefix(
  prefix: "query" | "mutation"
): CoverageReport {
  const prefixFilter = `${prefix}:`;
  const registered = Array.from(registeredOperations).filter((op) =>
    op.startsWith(prefixFilter)
  );
  const used = Array.from(usedOperations).filter((op) =>
    op.startsWith(prefixFilter)
  );

  const total = registered.length;
  const covered = used.length;
  const percent = calcPercent(total, covered);

  return {
    total,
    covered,
    percent,
    operations: {
      registered: registered.sort(),
      used: used.sort(),
      unused: registered.filter((op) => !usedOperations.has(op)).sort(),
    },
  };
}

export function resetCoverage(): void {
  registeredOperations.clear();
  usedOperations.clear();
}

export interface CoverageThreshold {
  minPercentTotal?: number;
  minPercentQueries?: number;
  minPercentMutations?: number;
}

export function checkThresholds(thresholds: CoverageThreshold): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (thresholds.minPercentTotal !== undefined) {
    const totalCoverage = getCoverage();
    if (totalCoverage.percent < thresholds.minPercentTotal) {
      failures.push(
        `Total coverage ${totalCoverage.percent.toFixed(1)}% below threshold ${
          thresholds.minPercentTotal
        }%`
      );
    }
  }

  if (thresholds.minPercentQueries !== undefined) {
    const queryCoverage = getCoverageByPrefix("query");
    if (queryCoverage.percent < thresholds.minPercentQueries) {
      failures.push(
        `Query coverage ${queryCoverage.percent.toFixed(1)}% below threshold ${
          thresholds.minPercentQueries
        }%`
      );
    }
  }

  if (thresholds.minPercentMutations !== undefined) {
    const mutationCoverage = getCoverageByPrefix("mutation");
    if (mutationCoverage.percent < thresholds.minPercentMutations) {
      failures.push(
        `Mutation coverage ${mutationCoverage.percent.toFixed(
          1
        )}% below threshold ${thresholds.minPercentMutations}%`
      );
    }
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}
