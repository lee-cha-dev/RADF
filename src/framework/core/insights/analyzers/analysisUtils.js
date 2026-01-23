export const findMeasureId = (rows, querySpec) => {
    if (querySpec?.measures?.length) {
        return querySpec.measures[0];
    }
    const sample = rows?.[0];
    if (!sample) {
        return null;
    }
    const numericKey = Object.keys(sample).find((key) => typeof sample[key] === 'number');
    return numericKey || null;
};