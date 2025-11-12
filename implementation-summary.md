# NDEF Payment Request Implementation

This implementation adds support for reading and writing Cashu payment requests via NFC tags using NDEF format. The implementation follows a similar pattern to the existing token NFC functionality but centralizes all NFC-related code in a new dedicated store.

## New WebNfcStore

The core of this implementation is the new `WebNfcStore`, which centralizes all NFC-related functionality:

- Handles reading from and writing to NFC tags
- Supports different data types (tokens and payment requests)
- Uses a mode-based approach to process different data formats
- Provides a clean API for other components to use

## Modifications to Existing Code

- Moved NFC tag functionality from `receiveTokensStore` to `WebNfcStore`
- Updated `payment-request.ts` to add methods for NFC scanning and writing
- Updated UI components to use the new centralized NFC functionality
- Added NFC scanning and writing buttons to the payment request dialog

## How It Works

### Reading Payment Requests

1. The user clicks the NFC button in the payment request dialog
2. The `WebNfcStore` starts scanning in "payment-request" mode
3. When an NFC tag is detected, the data is read and checked for a "creq" prefix
4. If valid, the payment request is passed to the `payment-request` store for processing
5. The payment request dialog displays the payment details

### Writing Payment Requests

1. The user creates a payment request
2. The user clicks the "Write to NFC" button
3. The `WebNfcStore` writes the payment request data to an NFC tag
4. The payment request is stored as a text record with the same format as displayed in the QR code

## Advantages of the New Approach

- Better code organization with all NFC-related functionality in one place
- Easier to maintain and extend with new NFC features
- Consistent behavior across different types of data
- Clearer separation of concerns between data processing and NFC functionality

## Future Enhancements

- Support for more data types through the same interface
- Advanced error handling and recovery
- Optimization for different tag types and sizes
