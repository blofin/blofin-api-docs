# Errors

Here is the REST API Error Code

Error Code | HTTP Status Code | Error Message
---------- | ------- | -------
400 | 200 | Bad Request 
401 | 200 | Invalid signature.
500 | 200 | Internal Server Error
404 | 200 | not found
405 | 200 | Method Not Allowed
406 | 200 | Not Acceptable
429 | 429 | Too Many Requests
1   | 200 | All operations failed
2   | 200 | Batch operation partially succeeded.
152001 | 200 | Parameter {} cannot be empty.
152002 | 200 | Parameter {} error.
152003 | 200 | Either parameter {} or {} is required.
152004 | 200 | JSON syntax error, Please check if the parameter should be an array or an object.
152005 | 200 | Parameter error: wrong or empty
152006 | 200 | Batch orders can be placed for up to 20 at once.
152007 | 200 | Batch orders can only be placed with the same instId and marginMode.
152008 | 200 | Only the same field is allowed for bulk cancellation of orders, orderId is preferred.
152009 | 200 | {} must be a combination of numbers, letters, or underscores, and the maximum length of characters is 32.
152011 | 200 | Transaction API Key does not support brokerId
152012 | 200 | BrokerId is required
152013 | 200 | Unmatched brokerId, please check your API key's bound broker
152014 | 200 | Instrument ID does not exist
152015 | 200 | Number of instId values exceeds the maximum limit of 20
152401 | 200 | Access key does not exist, Please go to the API Management page and check if it exists and is in an active state.
152402 | 200 | Access key has expired, Please go to the API Management page and check if it exists and is in an active state.
152404 | 200 | This operation is not supported, Please check the requestPath or API key permissions.
152405 | 200 | Timestamp in header or signature has expired, need to be within 60s
152406 | 200 | Your IP is not included in your API key's IP whitelist
152407 | 200 | Repeated nonce, Reusing within 60 seconds is not allowed.
152408 | 200 | Passphrase error
152409 | 200 | Signature verification failed, Please refer to [Signature Verification Failed](https://docs.blofin.com/index.html#signature-verification-failed)
152410 | 200 | The value of ACCESS-TIMESTAMP needs to be a millisecond timestamp, e.g: 1704038400000.
150003 | 200 | clientId already exist
150004 | 200 | Insufficient balance. please adjust the amount and try again.
542 | 200 | Exceeded the maximum order size limit
102002 | 200 | Duplicate customized order ID
102005 | 200 | Position had been closed
102014 | 200 | Limit order exceeds maximum order size limit
102015 | 200 | Market order exceeds maximum order size limit
102022 | 200 | Failed to place order. You don't have any positions of this contract. Turn off Reduce-only to continue.
102037 | 200 | TP trigger price should be higher than the latest trading price
102038 | 200 | SL trigger price should be lower than the latest trading price
102039 | 200 | TP trigger price should be lower than the latest trading price
102040 | 200 | SL trigger price should be higher than the latest trading price
102047 | 200 | Stop loss trigger price should be higher than the order price
102048 | 200 | stop loss trigger price must be higher than the best bid price
102049 | 200 | Take profit trigger price should be lower than the order price
102050 | 200 | stop loss trigger price must be lower than the best ask price
80001 | 200 | Parameters error
80006 | 200 | Affiliate do not exit. Please apply to be affiliate first.
102051 | 200 | stop loss trigger price should be lower than the order price
102052 | 200 | take profit trigger price should be higher than the order price
102053 | 200 | take profit trigger price should be lower than the best bid price
102054 | 200 | take profit trigger price should be higher than the best ask price
102055 | 200 | stop loss trigger price should be lower than the best ask price
102064 | 200 | Buy price is not within the price limit (Minimum: 310.40; Maximum:1,629.40)
102065 | 200 | Sell price is not within the price limit 
102068 | 200 | Cancel failed as the order has been filled, triggered, canceled or does not exist.
102089 | 200 | Position mode mismatch
103003 | 200 | Order failed. Insufficient USDT margin in account
103013 | 200 | Internal error; unable to process your request. Please try again.
110006 | 200 | You have pending cross orders. Please cancel them before adjusting your leverage.
110019 | 200 | Setting failed. Cancel any open orders, and close positions first.
