export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000,
  shouldRetry: (error: unknown) => boolean = () => true
): Promise<T> {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
      console.log(`Retry attempt ${attempt + 1} after ${Math.round(delay)}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
  
  throw new Error("Max retries exceeded");
}
