export abstract class PurchaseService {
  /**
   * Validates the purchase data.
   * @param data - The purchase data to validate.
   * @returns True if the data is valid, otherwise throws an error.
   */
  protected validatePurchaseData(data: any): boolean {
    if (!data.userId || !data.amount || !data.currency) {
      throw new Error(
        'Invalid purchase data. Required fields: userId, amount, currency.',
      );
    }
    return true;
  }

  /**
   * Logs the transaction details.
   * @param transaction - The transaction details to log.
   */
  protected logTransaction(transaction: any): void {
    console.log('Transaction logged:', transaction);
    // You can replace this with actual logging logic (e.g., saving to a database or external logging service)
  }

  /**
   * Handles errors during the purchase process.
   * @param error - The error to handle.
   */
  protected handleError(error: Error): void {
    console.error('Purchase error:', error.message);
    // You can extend this to send error notifications or log to an external service
  }

  /**
   * Abstract method to be implemented by subclasses for processing payments.
   * @param data - The purchase data.
   * @returns A promise resolving to the payment result.
   */
  public abstract processPayment(data: any): Promise<any>;
}
