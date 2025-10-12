export function calculateCreditsUsage(userDoc, pagesUsed, overageCostPerPage) {
  const data = userDoc.data() || {};
  const quota = data.pageQuota || 0;
  const used = data.pagesUsed || 0;
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
