export function maskInfo(info: string, start: number = 0, end = 0, mask = "*") {
	if (info.length <= start + end) {
		return info;
	}

	const s = info.substring(0, start);
	const mid = mask.repeat(info.length - start - end);
	const e = info.substring(info.length - end);
	return s + mid + e;
}
