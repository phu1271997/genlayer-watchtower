const categories = [
  ["DEFI_TRADING", 40, "Check slippage tolerance, max position size, leverage, and allowlists."],
  ["DEFI_YIELD", 55, "Check protocol allowlists, pool audit posture, and unrealistic APY chasing."],
  ["SOCIAL_MEDIA", 60, "Check PII leaks, spam patterns, and brand voice consistency."],
  ["DAO_TREASURY", 45, "Check signer count, voting thresholds, and recipient allowlists."],
  ["CONTENT_GEN", 60, "Check copyright, hate speech, misinformation, and attribution posture."],
  ["TOOLING", 60, "Check downstream API terms, rate-limit abuse, and privileged automation drift."],
  ["OTHER", 60, "Apply the generic fiduciary mandate and user-interest check."],
];

console.log(JSON.stringify({ categories }, null, 2));
