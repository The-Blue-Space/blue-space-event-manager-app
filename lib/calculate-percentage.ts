export const calculatePercentage = (value: number, total: number) => {
	if (!value || !total) return 0;
	if (total === 0) return 0;
	return ((value / total) * 100)
};
