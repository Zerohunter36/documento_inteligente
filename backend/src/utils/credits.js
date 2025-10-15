export function calculateCreditsUsage(userData, pagesUsed, overageCostPerPage) {
  const quota = userData?.pageQuota || 0;
  const used = userData?.pagesUsed || 0;
  const newTotal = used + pagesUsed;

  let overagePages = 0;
  if (newTotal > quota) {
    overagePages = newTotal - quota;
  }

  const overageCost = overagePages * overageCostPerPage;

  return {
    quota,
    newTotal,
    overagePages,
    overageCost,
  };
}
