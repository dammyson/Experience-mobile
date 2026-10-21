// Reads /customer/merchant/{id}/spendable into {points, value, currency, programs}.
// Uses the response's totals when present, otherwise adds up the per-program
// figures (estimated_value, or points × point_value).

const sum = (items, pick) =>
  items.reduce((total, item) => {
    const n = pick(item);
    return n == null || Number.isNaN(n) ? total : total + n;
  }, 0);

const programValue = program =>
  program.estimated_value != null
    ? Number(program.estimated_value)
    : program.points != null && program.point_value != null
      ? Number(program.points) * Number(program.point_value)
      : null;

export const getSpendableSummary = data => {
  const programs = data?.programs || [];

  const points =
    data?.spendable_points ??
    data?.points ??
    data?.total_points ??
    (programs.length ? sum(programs, p => Number(p.points)) : 0);

  const value =
    data?.spendable_value ??
    data?.estimated_value ??
    data?.total_estimated_value ??
    (programs.length ? sum(programs, programValue) : null);

  return {
    points: Number(points) || 0,
    value: value == null ? null : Number(value),
    currency: data?.currency || 'NGN',
    programs,
  };
};

// Naira value of one point at this merchant, from the spendable totals
// (null when the response has no value to derive it from)
export const pointValue = summary =>
  summary?.value != null && summary.points > 0 ? summary.value / summary.points : null;

// Points needed to cover `amount`, or null when the point value is unknown
export const pointsForAmount = (summary, amount) => {
  const value = pointValue(summary);
  return value ? Math.ceil((Number(amount) || 0) / value) : null;
};

// Estimated naira value of `points`, or null when the point value is unknown
export const valueOfPoints = (summary, points) => {
  const value = pointValue(summary);
  return value != null ? (Number(points) || 0) * value : null;
};
