# NDEF Payment Request Implementation

This implementation adds support for reading and writing Cashu payment requests via NFC tags using NDEF format. The implementation follows a similar pattern to the existing token NFC functionality but centralizes all NFC-related code in a new dedicated store.

## New WebNfcStore

The core of this implementation is the new `WebNfcStore`, which centralizes all NFC-related functionality:

- Handles reading from and writing to NFC tags
- Supports different data types (tokens and payment requests)
- Uses a mode-based approach to process different data formats
- Provides a clean API for other components to use

## Key Features

### 1. Payment Request Reading (Send Flow)
- Added ability to scan payment requests from NFC tags in the send flow
- Created a new `SendNfcScanner` component with a user-friendly interface
- Added NFC button to the send dialog header
- Scanned payment requests are automatically processed and prepared for payment

### 2. Payment Request Writing (Receive Flow)
- Added ability to write payment requests to NFC tags
- Added NFC buttons in the payment request dialog for reading/writing
- Uses the same NDEF text record format for both tokens and payment requests

## Modifications to Existing Code

- Moved NFC tag functionality from `receiveTokensStore` to `WebNfcStore`
- Updated `payment-request.ts` to add methods for NFC scanning and writing
- Updated UI components to use the new centralized NFC functionality
- Added NFC scanning and writing buttons to relevant dialogs

## How It Works

### Reading Payment Requests (Send Flow)

1. The user clicks the NFC button in the send dialog header
2. The `SendNfcScanner` overlay appears with instructions
3. The `WebNfcStore` starts scanning in "payment-request" mode
4. When an NFC tag is detected, the data is read and checked for a "creq" prefix
5. If valid, the payment request is passed to the send flow for processing
6. The payment dialog displays the payment details and the user can pay

### Writing Payment Requests (Receive Flow)

1. The user creates a payment request
2. The user clicks the "Write to NFC" button in the payment request dialog
3. The `WebNfcStore` writes the payment request data to an NFC tag
4. The payment request is stored as a text record with the same format as displayed in the QR code

## Advantages of the New Approach

- Better code organization with all NFC-related functionality in one place
- Easier to maintain and extend with new NFC features
- Consistent behavior across different types of data
- Clearer separation of concerns between data processing and NFC functionality
- Improved user experience with dedicated NFC scanner interface

## Implementation Details

- Uses NDEF Type 4 Forum tags (compatible with WebNFC standard)
- Text records for payment requests (similar to tokens)
- Centralized error handling and user feedback
- Full support for both reading and writing payment requests

## Future Enhancements

- Support for more data types through the same interface
- Advanced error handling and recovery
- Optimization for different tag types and sizes
