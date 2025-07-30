import { useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';

export const useSmartEffect = (
  cb: (previousDependencies: any[]) => void | (() => void),
  dependencies: any[],
  actualDependencies: any[]
) => {
  const refActualDependencies = useRef<any[]>([]);
  useEffect(() => {
    const changed = actualDependencies.some(
      (actualDependency, index) =>
        actualDependency !== refActualDependencies.current[index]
    );
    if (changed) {
      const result = cb(refActualDependencies.current);
      refActualDependencies.current = actualDependencies;

      return result;
    }
  }, dependencies);
};

export const useSmartEffectDeep = (
  cb: (previousDependencies: any[]) => void | (() => void),
  dependencies: any[],
  actualDependencies: any[]
) => {
  const refActualDependencies = useRef<any[]>([]);
  useEffect(() => {
    const changed = actualDependencies.some(
      (actualDependency, index) =>
        !isEqual(actualDependency, refActualDependencies.current[index])
    );
    if (changed) {
      const result = cb(refActualDependencies.current);
      refActualDependencies.current = actualDependencies;

      return result;
    }
  }, [dependencies]);
};

export const useWhatHaveChanged = (
  cb: (
    changes: {
      index: number;
      change: { deep: boolean; ref: boolean };
      prev: any;
      next: any;
    }[]
  ) => void,
  dependencies: any[]
) => {
  const refDependencies = useRef<any[]>([]);
  useEffect(() => {
    const changes: {
      index: number;
      change: { deep: boolean; ref: boolean };
      prev: any;
      next: any;
    }[] = [];
    dependencies.forEach((dependency, index) => {
      const isDeepEqual = isEqual(dependency, refDependencies.current[index]);
      const isRefEqual = dependency === refDependencies.current[index];
      if (!isDeepEqual || !isRefEqual) {
        changes.push({
          index,
          change: { deep: !isDeepEqual, ref: !isRefEqual },
          prev: refDependencies.current[index],
          next: dependency,
        });
      }
      refDependencies.current[index] = dependency;
    });
    cb(changes);
  }, [dependencies]);
};
