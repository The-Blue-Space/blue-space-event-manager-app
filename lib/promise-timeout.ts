export const promiseTimeout = <T>(
  data: T,
  isError = false,
  error: string = "error",
  duration: number = 2000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (isError) {
        reject(error);
      } else {
        resolve(data);
      }
    }, duration);
  });
};
