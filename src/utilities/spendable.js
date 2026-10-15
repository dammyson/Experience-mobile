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
