---
title: BloFin API guide | BloFin API Documents

language_tabs: # must be one of https://prismjs.com/#supported-languages
  - shell

toc_footers:

includes:
  - errors.md

search: true
code_clipboard: true
---

# Overview

Welcome to the BloFin API!

BloFin provides reliable REST and WebSocket APIs for secure trading operations. Our API suite supports:
- Efficient order management
- Market data access
- Position monitoring
- Risk management tools
- Account operations

## General Info
* Root URL for REST access: `https://openapi.blofin.com`
* Public WebSocket：`wss://openapi.blofin.com/ws/public`
* Private WebSocket：`wss://openapi.blofin.com/ws/private`
* All time and timestamp related fields are in **milliseconds**.
* All endpoints return either a JSON object or array.
* Data is returned in **descending** order. Newest first, oldest last.

### Demo Trading
* Root URL for demo-trading REST access: `https://demo-trading-openapi.blofin.com`
* Public WebSocket for demo-trading：`wss://demo-trading-openapi.blofin.com/ws/public`
* Private WebSocket  for demo-trading：`wss://demo-trading-openapi.blofin.com/ws/private`

### General Information on Endpoints
* For `GET` endpoints, parameters must be sent as a query string.
* Parameters may be sent in any order.

### Copy Trading
* Private WebSocket：`wss://openapi.blofin.com/ws/copytrading/private`
## API Key Creation
Please refer to [my API page](https://blofin.com/account/apis) regarding API Key creation. 

### Generating an API Key
Create an API Key on the website before signing any requests. After creating an API Key, keep the following information safe:

* API Key
* Secret Key

There are two permissions below that can be associated with an API Key. One or more permission can be assigned to any Key.

* `READ` - Can request and view account info such as bills and order history.
* `TRADE` - Can place and cancel orders, and request and view account info such as bills and history.
* `TRANSFER` - Can make funding transfers between different accounts

<aside class="notice">
Each API Key can be linked with up to 20 IP addresses. API Keys that are not bound to IPs will expire after 90 days.
</aside>

## REST Authentication
### Making Requests
All private REST requests must contain the following headers:

* `ACCESS-KEY` The API Key as a String.

* `ACCESS-SIGN` The Base64-encoded signature (see Signing Messages subsection for details).

* `ACCESS-TIMESTAMP` The UTC timestamp of your request .e.g : `1597026383085`

* `ACCESS-NONCE` The client's random string generation algorithm must not produce duplicates within the time difference range allowed by the server, such as UUID, Snowflake algorithm, etc. 

* `ACCESS-PASSPHRASE` The passphrase you specified when creating the APIKey.

Request bodies should have content type `application/json` and be in valid JSON format.

### Signature

The ACCESS-SIGN header is generated as follows:

1. Create a prehash string by concatenating:
   * `requestPath` (including query parameters for GET requests)
   * `method` (HTTP method in uppercase: GET, POST, etc.)
   * `timestamp` (milliseconds since epoch)
   * `nonce` (unique identifier like UUID)
   * `body` (JSON string for POST requests, empty string for GET)

2. Generate HMAC-SHA256 signature using the SecretKey
3. Convert signature to hexadecimal
4. Encode the hex signature in Base64 format

Examples:

GET Request:
```python
# Python
path = "/api/v1/asset/balances?accountType=futures"
method = "GET"
timestamp = str(int(datetime.now().timestamp() * 1000))
nonce = str(uuid4())
body = ""  # Empty for GET requests

prehash = f"{path}{method}{timestamp}{nonce}{body}"
hex_signature = hmac.new(
    secret_key.encode(),
    prehash.encode(),
    hashlib.sha256
).hexdigest().encode()

signature = base64.b64encode(hex_signature).decode()
```

```javascript
// JavaScript
const path = '/api/v1/asset/balances?accountType=futures';
const method = 'GET';
const body = '';  // Empty for GET requests

const prehash = path + method + timestamp + nonce + body;
const hex_signature = CryptoJS.HmacSHA256(prehash, secretKey).toString();
const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(hex_signature)
);
```

POST Request:
```python
# Python
path = "/api/v1/trade/order"
method = "POST"
timestamp = str(int(datetime.now().timestamp() * 1000))
nonce = str(uuid4())
body = {
    "instId": "BTC-USDT",
    "marginMode": "isolated",
    "side": "buy",
    "orderType": "limit",
    "price": "35000",
    "size": "0.1"  # Minimum order size is 0.1 contracts
}

body_str = json.dumps(body)
prehash = f"{path}{method}{timestamp}{nonce}{body_str}"
hex_signature = hmac.new(
    secret_key.encode(),
    prehash.encode(),
    hashlib.sha256
).hexdigest().encode()

signature = base64.b64encode(hex_signature).decode()
```

```python
def sign_request(secret: str, method: str, path: str, body: dict | None = None) -> str:
    """Generate BloFin API request signature.
    
    Args:
        secret: API secret key
        method: HTTP method (GET, POST, etc.)
        path: API endpoint path (including query params)
        body: Request body for POST/PUT requests (None for GET)
        
    Returns:
        Base64-encoded signature string
    
    Example:
        # GET request
        sign = sign_request(
            secret="YOUR_SECRET",
            method="GET",
            path="/api/v1/account/balance"
        )
        
        # POST request
        sign = sign_request(
            secret="YOUR_SECRET",
            method="POST",
            path="/api/v1/trade/order",
            body={
                "instId": "BTC-USDT",
                "marginMode": "isolated",
                "side": "buy",
                "orderType": "limit",
                "price": "35000",
                "size": "0.1"  # Minimum order size is 0.1 contracts
            }
        )
    """
    timestamp = str(int(datetime.now().timestamp() * 1000))
    nonce = str(uuid4())
    
    # Create prehash string
    msg = f"{path}{method}{timestamp}{nonce}"
    if body:
        msg += json.dumps(body)
        
    # Generate hex signature and convert to base64
    hex_signature = hmac.new(
        secret.encode(),
        msg.encode(),
        hashlib.sha256
    ).hexdigest().encode()
    
    return base64.b64encode(hex_signature).decode()
```
 

  

 
  

The `timestamp` value is the same as the `ACCESS-TIMESTAMP` header with millisecond, e.g. `1597026383085`.

The request method should be in UPPERCASE: e.g. `GET` and `POST`.

The `requestPath` is the path of requesting an endpoint.

Example: `/api/v1/asset/balances?accountType=futures`

The `body` refers to the String of the request body. It can be omitted if there is no request body (frequently the case for `GET` requests).

Example: `{"instId":"BTC-USDT","leverage":"5","marginMode":"isolated"}`

<aside class="notice">
 `GET` request parameters are counted as requestpath, not body</aside>

The SecretKey is generated when you create an APIKey.

Example: `YOUR_API_KEY`

### Signature Verification Failed
If you encounter a "Signature verification failed" error, please follow the steps below to troubleshoot:
* The JSON string of the body should not contain any extra spaces. Incorrect example: `{ "instId" : "BTC-USDT" , "leverage":"5","marginMode":"isolated"}`
* The code for signing can be directly copied from the example above for comparison, and the following is the explanation of the signing steps(on the right side).
<aside class="notice">
After obtaining the result of `HMAC SHA256`, it needs to be converted to a hexadecimal string first, and then the string should be converted to bytes. Please note that it is not hex2bytes, but rather string2bytes.
</aside>


```python
def create_signature_blofin(secret_key, nonce, method, timestamp, path, body=None):
    # If it is a GET request, the body must be "".
    if body:
        prehash_string = f"{path}{method}{timestamp}{nonce}{json.dumps(body)}"
    else:
        prehash_string = f"{path}{method}{timestamp}{nonce}"
    encoded_string = prehash_string.encode()
    signature = hmac.new(secret_key.encode(), encoded_string, hashlib.sha256)
    #The implementation here differs slightly from the signature used by other exchanges. It needs to be converted to a hexadecimal string and then converted to bytes. Please note that it is not hex2bytes, but rather string2bytes.
    hexdigest = signature.hexdigest() #Convert the signature result into a hexadecimal string.
    hexdigest_to_bytes = hexdigest.encode() #Convert this string into bytes.
    base64_encoded = base64.b64encode(hexdigest_to_bytes).decode() #Base64 encoding
    return base64_encoded


# If you are using python's `requests` library, for a POST request, the code would be: 
# response = requests.post(url, headers=headers, json=body) 
# Please note that the parameter name is `json` not `data`
```

## WebSocket 
### Overview
WebSocket is a new HTML5 protocol that achieves full-duplex data transmission between the client and server, allowing data to be transferred effectively in both directions. A connection between the client and server can be established with just one handshake. The server will then be able to push data to the client according to preset rules. Its advantages include:

* The WebSocket request header size for data transmission between client and server is only 2 bytes.
* Either the client or server can initiate data transmission.
* There's no need to repeatedly create and delete TCP connections, saving resources on bandwidth and server.

<aside class="notice">
We recommend developers use WebSocket API to retrieve market data and order book depth.
</aside>

### WebSocket Authentication

The WebSocket API requires authentication for private channels. Use the login operation with a signed request to authenticate your connection.

> Request Example:
```json
{
    "op": "login",
    "args": [{
        "apiKey": "YOUR_API_KEY",
        "passphrase": "YOUR_PASSPHRASE",
        "timestamp": "1597026383085",
        "sign": "BASE64_ENCODED_SIGNATURE",
        "nonce": "123e4567-e89b-12d3-a456-426614174000"
    }]
}
```

#### Signature Generation

The signature (`sign`) parameter is generated using HMAC-SHA256 with fixed components:

1. Fixed components for WebSocket authentication:
   * `path`: Always "/users/self/verify"
   * `method`: Always "GET"
   * `timestamp`: Current time in milliseconds
   * `nonce`: Random generated unique id

2. Create signature string by concatenating: path + method + timestamp + nonce
3. Generate HMAC-SHA256 hex digest using your SecretKey
4. Encode the hex digest using Base64

Example implementation:
```python
async def sign_websocket_login(secret: str, api_key: str, passphrase: str) -> tuple[str, str, str]:
    """Generate WebSocket login signature."""
    timestamp = str(int(time.time() * 1000))
    nonce = timestamp
    
    # Fixed components for WebSocket auth
    method = "GET"
    path = "/users/self/verify"
    # Create signature string
    msg = f"{path}{method}{timestamp}{nonce}"
    hex_signature = hmac.new(
        secret.encode(),
        msg.encode(),
        hashlib.sha256
    ).hexdigest().encode()
    
    return base64.b64encode(hex_signature).decode(), timestamp, nonce
```

#### Connection Management

The WebSocket connection requires proper authentication and connection management:
- Use heartbeat mechanism to maintain connection (send 'ping' every 20-30 seconds)
- Handle connection errors gracefully
- Clean up resources properly
- Monitor connection status
- Add broker ID header if required for your API key

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `login`
args | Array | Yes | List of account login parameters
`>apiKey` | String | Yes | API Key
`>passphrase` | String | Yes | The passphrase specified when creating the APIKey
`>timestamp` | String | Yes | Unix Epoch time in milliseconds (e.g., `1597026383085`)
`>sign` | String | Yes | Base64-encoded HMAC-SHA256 signature
`>nonce` | String | Yes | Unique identifier (UUID recommended) to prevent replay attacks


> Successful Response Example:

```json
{
  "event": "login",
  "code": "0",
  "msg": ""
}
```
> Failure Response Example:

```json
{
  "event": "error",
  "code": "60009",
  "msg": "Login failed."
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
event | String | Operation, `login` `error`
code | String | Error code
msg | String | Error message

**apiKey**: Unique identification for invoking API. Requires user to apply one manually.

**passphrase**: API Key password

**timestamp**: the Unix Epoch time, the unit is milliseconds

**sign**: Signature string generated using the following algorithm:

1. Create a prehash string by concatenating:
   * `requestPath`: The API endpoint path (including query parameters for GET requests)
   * `method`: HTTP method in uppercase (GET, POST, etc.)
   * `timestamp`: Current time in milliseconds since epoch
   * `nonce`: Unique identifier (e.g., UUID)
   * `body`: JSON string for POST requests, empty string for GET

2. Generate signature using HMAC-SHA256 with your SecretKey
3. Convert signature to hexadecimal format
4. Encode the hex signature using Base64


**Important Notes**:
- The signature is required for all authenticated endpoints
- Both GET and POST requests require signatures
- For GET requests, query parameters are part of the requestPath
- For POST requests, include the JSON body in the signature

<aside class="notice">
The request will expire 1 minute after the timestamp.
</aside>

### Subscribe
#### Subscription Instructions
> Request Format Discription:
```shell
{
    "op":"subscribe",
    "args":[
        "<SubscriptionTopic> "
    ]
}
```
WebSocket channels are divided into two categories: public and private channels.

`Public channels` -- No authentication is required, include candlesticks channel, trades channel, order book channel etc.

`Private channels` -- including orders channel, positions channel, and orders-algo channel, etc -- require log in.

Users can choose to subscribe to one or more channels, and the total length of multiple channels cannot exceed 4,096 bytes.

Below is an example of subscription parameters. The requirement of subscription parameters for each channel is different. For details please refer to the specification of each channels.

> Request Example:
```shell
{
    "op":"subscribe",
    "args":[
        {
            "channel":"books5",
            "instId":"BTC-USDT"
        },
        {
            "channel":"candle1m",
            "instId":"BTC-USDT"
        }
    ]
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name
`>instId` | String | Yes | Instrument ID


> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "books5",
        "instId": "BTC-USDT"
    }
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
event | String | Operation, `subscribe` `error`
arg | Object | Subscribed channel
`>channel` | String | Yes | Channel name
`>instId` | String | Yes | Instrument ID
code | String | Error code
msg | String | Error message

### Unsubscribe
#### Subscription Instructions
> Request Format Discription:
```shell
{
    "op":"unsubscribe",
    "args":[
        "<SubscriptionTopic> "
    ]
}
```
Unsubscribe from one or more channels.

> Request Example:
```shell
{
    "op":"unsubscribe",
    "args":[
        {
            "channel":"books5",
            "instId":"BTC-USDT"
        },
        {
            "channel":"candle1m",
            "instId":"BTC-USDT"
        }
    ]
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name
`>instId` | String | Yes | Instrument ID


> Response Example:

```json
{
    "event": "unsubscribe",
    "arg": {
        "channel": "books5",
        "instId": "BTC-USDT"
    }
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
event | String | Operation, `unsubscribe` `error`
arg | Object | Unsubscribed channel
`>channel` | String | Yes | Channel name
`>instId` | String | Yes | Instrument ID
code | String | Error code
msg | String | Error message


## Rate Limits
Our REST and WebSocket APIs use rate limits to protect our APIs against malicious usage so our trading platform can operate reliably and fairly.

When a request is rejected by our system due to rate limits, the system will return error code 429 (Rate limit reached. Please refer to API documentation and throttle requests accordingly).

### REST API Limits
* Limit the call of the endpoint by IP, up to 500 requests per minute, if triggered, the service will be suspended for 5 minutes; up to 1500 requests per 5 minutes, if triggered, the service will be suspended for 1 hour.
* Rate limits of trading-related APIs at 30 requests every 10 seconds (based on UserId)

### WebSocket Connection Management

#### Connection Limits
* **New Connections**: 1 per second per IP
* **Channel Types**: 
  - Public channels via public service endpoint
  - Private channels via private service endpoint

<aside class="notice">

If there’s a network problem, the system will automatically disable the connection.

The connection will break automatically if the subscription is not established or data has not been pushed for more than 30 seconds.

To keep the connection stable:

1.Set a timer of N seconds whenever a response message is received, where N is less than 30.

2.If the timer is triggered, which means that no new message is received within N seconds, send the String 'ping'.

3.Expect a 'pong' as a response. If the response message is not received within N seconds, please raise an error or reconnect.
</aside>

## Risk Control Restrictions
BloFin has two types of risk control strategies for APIs: rate limit, network firewall restrictions. 

### Network Firewall Restrictions
Currently, we do not provide explicit information about network firewall restrictions. 

If you receive an HTTP 403 error message, it means you have violated a network firewall rule. In most cases, this error occurs due to excessive requests and will result in a five-minute temporary ban. 

If your requests are deemed malicious, it could result in an extended ban or potentially even a permanent suspension.

# Public Data
The API endpoints of `Public Data` do not require authentication.

## REST API

### GET Instruments


Retrieve a list of instruments with open contracts.

#### HTTP Request

`GET /api/v1/market/instruments`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/instruments?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "instId": "BTC-USDT",
            "baseCurrency": "BTC",
            "quoteCurrency": "USDT",
            "contractValue": "0.001",  # Each contract = 0.001 BTC
            "listTime": "1638333031000",
            "expireTime": "1704124800000",
            "maxLeverage": "125",
            "minSize": "0.1",  # Minimum order size is 0.1 contracts
            "lotSize": "0.1",  # Contract size increment
            "tickSize": "0.5",
            "instType": "SWAP",
            "contractType": "linear",
            "maxLimitSize": "100000000",
            "maxMarketSize": "1000000",
            "state": "live",
            "settleCurrency": "USDT"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
instId | String | Instrument ID, e.g. `BTC-USDT`
baseCurrency | String | Base currency, e.g. BTC in BTC-USDT
quoteCurrency | String | Quote currency, e.g. USDT in BTC-USDT
contractValue | String | Contract value in base currency (e.g. 0.001 BTC per contract for BTC-USDT)
listTime | String | Listing time, Unix timestamp format in milliseconds, e.g. `1597026383085`
expireTime | String | Instrument offline time, e.g. `1597026383085`
maxLeverage | String | Max Leverage
minSize | String | Minimum order size in contracts (e.g. 0.1 contracts = 0.0001 BTC for BTC-USDT)
lotSize | String | Contract size increment (e.g. 0.1 for BTC-USDT)
tickSize | String | Tick size, e.g. `0.0001`
instType | String | Instrument type
contractType | String | Contract type<br>`linear`: linear contract<br>`inverse`: inverse contract
maxLimitSize | String | The maximum order quantity of the limit order
maxMarketSize | String | The maximum order quantity of the market order
state | String | Instrument status<br>`live`<br>`suspend`
settleCurrency | String | Settlement and margin currency, e.g. `BTC`


### GET Tickers

Retrieve the latest price snapshot, best bid/ask price, and trading volume in the last 24 hours.

#### HTTP Request

`GET /api/v1/market/tickers`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/tickers?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "instId": "BTC-USDT",
            "last": "27187",
            "lastSize": "1",
            "askPrice": "27187.5",
            "askSize": "20",
            "bidPrice": "27187",
            "bidSize": "2",
            "high24h": "27463.5",
            "open24h": "27186.5",
            "low24h": "26647.5",
            "volCurrency24h": "3224.82",
            "vol24h": "3224820",
            "ts": "1695261862487"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
instId | String | Instrument ID, e.g. `BTC-USDT`
last | String | Last traded price
lastSize | String | Last traded size
askPrice | String | Best ask price
askSize | String | Best ask size
bidPrice | String | Best bid price
bidSize | String | Best bid size
high24h | String | Highest price in the past 24 hours
open24h | String | Open price in the past 24 hours
low24h | String | Lowest price in the past 24 hours
volCurrency24h | String | 24h trading volume, with a unit of base `currency`.
vol24h | String | 24h trading volume, with a unit of `contract`.
ts | String | Ticker data generation time, Unix timestamp format in milliseconds, e.g. `1597026383085`

### GET Order Book

Retrieve order book of the instrument.

#### HTTP Request

`GET /api/v1/market/books`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/books?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
size | String | No | Order book depth per side. Maximum 100, e.g. 100 bids + 100 asks<br>Default returns to 1 depth data


> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "asks": [
                [
                    "1620",
                    "72"
                ],
                [
                    "1620.01",
                    "317"
                ],
                [
                    "1620.03",
                    "56"
                ]
            ],
            "bids": [
                [
                    "1619.99",
                    "49"
                ],
                [
                    "1619.98",
                    "1905"
                ],
                [
                    "1619.97",
                    "397"
                ]
            ],
            "ts": "1695262080136"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
asks | Array | Order book on sell side
bids | Array | Order book on buy side
ts | String | Order book generation time e.g.`1597026383085`

<aside class="notice">
An example of the array of asks and bids values: ["411.8", "10"]

- "411.8" is the depth price
- "10" is the quantity at the price (number of contracts)</aside>


### GET Trades

Retrieve the recent transactions of an instrument.

#### HTTP Request

`GET /api/v1/market/trades`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/trades?instId=BTC-USDT&limit=50
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
limit | String | No | Number of results per request. <br>The maximum is `100`; <br>The default is `100`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "tradeId": "124892894",
            "instId": "ETH-USDT",
            "price": "1620.11",
            "size": "34",
            "side": "sell",
            "ts": "1695262343171"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
tradeId | Long | Trade ID
instId | String | Instrument ID
price | String | Trade price
size | String | Trade quantity
side | String | Trade side<br>`buy`<br>`sell`
ts | String | Trade time, Unix timestamp format in milliseconds, e.g.`1597026383085`


### GET Mark Price

Retrieve index and mark price.

#### HTTP Request

`GET /api/v1/market/mark-price`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/mark-price?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "instId": "ETH-USDT",
            "indexPrice": "1620.78",
            "markPrice": "1620.58",
            "ts": "1695262570838"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
instId | String | Instrument ID
indexPrice | String | Index price
markPrice | String | Mark price
ts | String | Data return time, Unix timestamp format in milliseconds, e.g.`1597026383085`

### GET Funding Rate

Retrieve funding rate.

#### HTTP Request

`GET /api/v1/market/funding-rate`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/funding-rate?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- |------| -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "instId": "BTC-USDT",
            "fundingRate": "0.000330372404346635",
            "fundingTime": "1703462400000"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
instId | String | Instrument ID
fundingRate | String | Current funding rate
fundingTime | String | Settlement time, Unix timestamp format in milliseconds, e.g. `1597026383085`

### GET Funding Rate History

Retrieve funding rate history. 

#### HTTP Request

`GET /api/v1/market/funding-rate-history`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/funding-rate-history?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
before | String | No | Pagination of data to return records newer than the requested `fundingTime`
after | String | No | Pagination of data to return records earlier than the requested `fundingTime`
limit | String | No | Number of results per request. The maximum is `100`; The default is `100`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "instId": "BTC-USDT",
            "fundingRate": "0.000330372404346635",
            "fundingTime": "1703462400000"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
--------- | ------- | -----------
instId | String | Instrument ID
fundingRate | String | Actual funding rate
fundingTime | String | Settlement time, Unix timestamp format in milliseconds, e.g. `1597026383085`

### GET Candlesticks

Retrieve the candlestick charts.

#### HTTP Request

`GET /api/v1/market/candles`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/candles?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
bar | String | No | Bar size, the default is `1m`<br>e.g. `1m`/`3m`/`5m`/`15m`/`30m`/`1H`/`2H`/`4H`/`6H`/`8H`/`12H`/`1D`/`3D`/`1W`/`1M`
after | String | No | Pagination of data to return records earlier than the requested `ts`
before | String | No | Pagination of data to return records newer than the requested `ts`. The latest data will be returned when using `before` individually
limit | String | No | Number of results per request. The maximum is `1440`. The default is `500`.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        [
            "1703484240000",
            "2283.45",
            "2283.45",
            "2282.8",
            "2282.8",
            "835",
            "8.35",
            "19063.9805",
            "1"
        ]
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
ts | String | Opening time of the candlestick, Unix timestamp format in milliseconds, e.g. `1672502400000`
open | String | Open price
high | String | Highest price
low | String | Lowest price
close | String | Close price
vol | String | Trading volume, with a unit of contracts.
volCurrency | String | Trading volume, with a unit of base currency.
volCurrencyQuote | String | Trading volume, with a unit of quote currency.
confirm | String | The state of candlesticks.<br>`0` represents that it is uncompleted, `1` represents that it is completed.

### GET Index Candlesticks

Retrieve the index candlestick charts.

#### HTTP Request

`GET /api/v1/market/index-candles`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/index-candles?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
bar | String | No | Bar size, the default is `1m`<br>e.g. `1m`/`3m`/`5m`/`15m`/`30m`/`1H`/`2H`/`4H`/`6H`/`8H`/`12H`/`1D`/`3D`/`1W`/`1M`
after | String | No | Pagination of data to return records earlier than the requested `ts`
before | String | No | Pagination of data to return records newer than the requested `ts`. The latest data will be returned when using `before` individually
limit | String | No | Number of results per request. The maximum is `1440`. The default is `500`.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        [
            "1703484240000",
            "2283.45",
            "2283.45",
            "2282.8",
            "2282.8",
            "1"
        ]
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
ts | String | Opening time of the candlestick, Unix timestamp format in milliseconds, e.g. `1672502400000`
open | String | Open price
high | String | Highest price
low | String | Lowest price
close | String | Close price
confirm | String | The state of candlesticks.<br>`0` represents that it is uncompleted, `1` represents that it is completed.

### GET Mark Price Candlesticks

Retrieve the mark price candlestick charts.

#### HTTP Request

`GET /api/v1/market/mark-price-candles`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/market/mark-price-candles?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
bar | String | No | Bar size, the default is `1m`<br>e.g. `1m`/`3m`/`5m`/`15m`/`30m`/`1H`/`2H`/`4H`/`6H`/`8H`/`12H`/`1D`/`3D`/`1W`/`1M`
after | String | No | Pagination of data to return records earlier than the requested `ts`
before | String | No | Pagination of data to return records newer than the requested `ts`. The latest data will be returned when using `before` individually
limit | String | No | Number of results per request. The maximum is `1440`. The default is `500`.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        [
            "1703484240000",
            "2283.45",
            "2283.45",
            "2282.8",
            "2282.8",
            "1"
        ]
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
ts | String | Opening time of the candlestick, Unix timestamp format in milliseconds, e.g. `1672502400000`
open | String | Open price
high | String | Highest price
low | String | Lowest price
close | String | Close price
confirm | String | The state of candlesticks.<br>`0` represents that it is uncompleted, `1` represents that it is completed.

## WebSocket
### WS Trades Channel

This channel uses public WebSocket and authentication is not required.

Retrieve the recent trades data. Data will be pushed whenever there is a trade. Every update contain only one trade.


> Request Example
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"trades",
            "instId":"ETH-USDT"
        }
    ]
}
```
#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Arrey | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `trades`
`>instId` | String | Yes | Instrument ID


> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "trades",
        "instId": "ETH-USDT"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"trades\", \"instId\" : \"ETH-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | Object | Event, `subscribe` `unsubscribe` `error`
arg | String | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg":{
        "channel":"trades",
        "instId":"ETH-USDT"
    },
    "data":[
        {
            "instId":"ETH-USDT",
            "tradeId":"106074994",
            "price":"1640.4",
            "size":"1",
            "side":"sell",
            "ts":"1696646190511"
        }
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | String | Successfully subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
data | Object | Subscribed data
`instId` | String | Instrument ID
`tradeId` | String | Trade ID
`price` | String | Trade price
`size` | String | Trade size
`side` | String | Trade direction, `buy`,`sell`
`ts` | String | Filled time, Unix timestamp format in milliseconds, e.g. `1597026383085`

### WS Candlesticks Channel

This channel uses public WebSocket and authentication is not required.

Retrieve the candlesticks data of an instrument. the push frequency is the fastest interval 1 second push the data.


> Request Example
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"candle1D",
            "instId":"BTC-USDT"
        }
    ]
}
```
#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name <br>`candle1m` <br>`candle3m` <br>`candle5m` <br>`candle15m` <br>`candle30m` <br>`candle1H` <br>`candle2H` <br>`candle4H` <br>`candle6H` <br>`candle8H` <br>`candle12H` <br>`candle1D` <br>`candle3D` <br>`candle1W` <br>`candle1M`
`>instId` | String | Yes | Instrument ID


> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "candle1D",
        "instId": "BTC-USDT"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"candle1D\", \"instId\" : \"BTC-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | Object | Event, `subscribe` `unsubscribe` `error`
arg | String | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg":{
        "channel":"candle1D",
        "instId":"BTC-USDT"
    },
    "data":[
        [
            "1696636800000",
            "27491.5",
            "27495",
            "27483",
            "27489.5",
            "95359",
            "95.359",
            "2621407.651",
            "0"
        ]
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | String | Successfully subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
data | Object | Subscribed data
`>ts` | String | Opening time of the candlestick, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>open` | String | Open price
`>high` | String | Highest price
`>low` | String | Lowest price
`>close` | String | Close price
`>vol` | String | Trading volume, with a unit of contracts.
`>volCurrency` | String | Trading volume, with a unit of base currency.
`>volCurrencyQuote` | String | Trading volume, with a unit of quote currency.
`>confirm` | String | The state of candlesticks.<br>`0` represents that it is uncompleted, `1` represents that it is completed.

### WS Index candlesticks Channel

This channel uses public WebSocket and authentication is not required.

Retrieve the candlesticks data of an instrument. the push frequency is the fastest interval 1 second push the data.


> Request Example
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"index-candle1D",
            "instId":"BTC-USDT"
        }
    ]
}
```
#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name <br>`index-candle1m` <br>`index-candle3m` <br>`index-candle5m` <br>`index-candle15m` <br>`index-candle30m` <br>`index-candle1H` <br>`index-candle2H` <br>`index-candle4H` <br>`index-candle6H` <br>`index-candle8H` <br>`index-candle12H` <br>`index-candle1D` <br>`index-candle3D` <br>`index-candle1W` <br>`index-candle1M`
`>instId` | String | Yes | Instrument ID


> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "index-candle1D",
        "instId": "BTC-USDT"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"index-candle1D\", \"instId\" : \"BTC-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | Object | Event, `subscribe` `unsubscribe` `error`
arg | String | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg":{
        "channel":"index-candle1D",
        "instId":"BTC-USDT"
    },
    "data":[
        [
            "1753151760000",
            "3781.07",
            "3784.12",
            "3781.07",
            "3783.98",
            "0"
        ]
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | String | Successfully subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
data | Object | Subscribed data
`>ts` | String | Opening time of the candlestick, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>open` | String | Open price
`>high` | String | Highest price
`>low` | String | Lowest price
`>close` | String | Close price
`>confirm` | String | The state of candlesticks.<br>`0` represents that it is uncompleted, `1` represents that it is completed.

### WS Mark price candlesticks Channel

This channel uses public WebSocket and authentication is not required.

Retrieve the candlesticks data of an instrument. the push frequency is the fastest interval 1 second push the data.


> Request Example
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"mark-price-candle1D",
            "instId":"BTC-USDT"
        }
    ]
}
```
#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name <br>`mark-price-candle1m` <br>`mark-price-candle3m` <br>`mark-price-candle5m` <br>`mark-price-candle15m` <br>`mark-price-candle30m` <br>`mark-price-candle1H` <br>`mark-price-candle2H` <br>`mark-price-candle4H` <br>`mark-price-candle6H` <br>`mark-price-candle8H` <br>`mark-price-candle12H` <br>`mark-price-candle1D` <br>`mark-price-candle3D` <br>`mark-price-candle1W` <br>`mark-price-candle1M`
`>instId` | String | Yes | Instrument ID


> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "mark-price-candle1D",
        "instId": "BTC-USDT"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"mark-price-candle1D\", \"instId\" : \"BTC-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | Object | Event, `subscribe` `unsubscribe` `error`
arg | String | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg":{
        "channel":"mark-price-candle1D",
        "instId":"BTC-USDT"
    },
    "data":[
        [
            "1753151760000",
            "3781.07",
            "3784.12",
            "3781.07",
            "3783.98",
            "0"
        ]
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | String | Successfully subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
data | Object | Subscribed data
`>ts` | String | Opening time of the candlestick, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>open` | String | Open price
`>high` | String | Highest price
`>low` | String | Lowest price
`>close` | String | Close price
`>confirm` | String | The state of candlesticks.<br>`0` represents that it is uncompleted, `1` represents that it is completed.

### WS Order Book Channel

This channel uses public WebSocket and authentication is not required.

Retrieve order book data.
Use `books` for 200 depth levels, `books5` for 5 depth levels

- `books`: 200 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms for the changes in the order book during that period of time.
- `books5`: 5 depth levels snapshot will be pushed every time. Snapshot data will be pushed every 100 ms when there are changes in the 5 depth levels snapshot.

> Request Example
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"books",
            "instId":"BTC-USDT"
        }
    ]
}
```
#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `books` `books5`
`>instId` | String | Yes | Instrument ID


> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "books",
        "instId": "BTC-USDT"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"books\", \"instId\" : \"BTC-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | Object | Event, `subscribe` `unsubscribe` `error`
arg | String | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:Full Snapshot

```json
{
    "arg":{
        "channel":"books",
        "instId":"ETH-USDT"
    },
    "action":"snapshot",
    "data":{
        "asks":[
            [
                1639.75,
                392
            ],
            [
                1639.95,
                541
            ]
        ],
        "bids":[
            [
                1639.7,
                6817
            ],
            [
                1639.65,
                4744
            ]
        ],
        "ts":"1696670727520",
        "prevSeqId":"0",
        "seqId":"107600747"
    }
}
```
> Push Data Example:Incremental Data

```json
{
    "arg":{
        "channel":"books",
        "instId":"ETH-USDT"
    },
    "action":"update",
    "data":{
        "asks":[
            [
                1639.95,
                2208
            ],
            [
                1640,
                4605
            ]
        ],
        "bids":[
            [
                1639.65,
                7115
            ],
            [
                1639.6,
                4791
            ]
        ],
        "ts":"1696670728525",
        "prevSeqId":"107600747",
        "seqId":"107600806"
    }
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | String | Successfully subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
action | Object | Push data action, incremental data or full snapshot.<br>`snapshot`: full<br>`update`: incremental
data | Object | Subscribed data
`>asks` | String | Order book on sell side
`>bids` | String | Order book on buy side
`>ts` | String | Order book generation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>prevSeqld` | String | Sequence ID of the last sent message. Only applicable to `books`
`>seqld` | String | Sequence ID of the current message, implementation details below
<aside class="notice">
An example of the array of asks and bids values: ["411.8", "10"]

- "411.8" is the depth price

- "10" is the quantity at the price (number of contracts)
</aside>

#### Sequence ID
SeqId is the sequence ID of the market data published. The set of sequence ID received by users is the same if users are connecting to the same channel through multiple websocket connections. Each instId has an unique set of sequence ID. Users can use prevSeqId and seqId to build the message sequencing for incremental order book updates. Generally the value of seqId is larger than prevSeqId. The prevSeqId in the new message matches with seqId of the previous message. In snapshot messages the prevSeqId is always 0.

**Example**

1. Snapshot message: prevSeqId = 0, seqId = 10
2. Incremental message 1 (normal update): prevSeqId = 10, seqId = 15


#### Merging incremental data into full data
After subscribing to the incremental load push (such as `books` 200 levels) of Order Book Channel, users first receive the initial full load of market depth. After the incremental load is subsequently received, update the local full load.

1. If there is the same price, compare the size. If the size is 0, delete this depth data. If the size changes, replace the original data.
2. If there is no same price, sort by price (bid in descending order, ask in ascending order), and insert the depth information into the full load.

### WS Tickers Channel

This channel uses public WebSocket and authentication is not required.

Retrieve the tickers data of an instrument. the push frequency is the fastest interval 1 second push the data.


> Request Example
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"tickers",
            "instId":"BTC-USDT"
        }
    ]
}
```
#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `tickers`
`>instId` | String | Yes | Instrument ID


> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "tickers",
        "instId": "BTC-USDT"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"tickers\", \"instId\" : \"BTC-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | Object | Event, `subscribe` `unsubscribe` `error`
arg | String | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg": {
        "channel": "tickers",
        "instId": "BTC-USDT"
    },
    "data": [{
        "instId": "BTC-USDT",
        "last": "9999.99",
        "lastSize": "0.1",
        "askPrice": "9999.99",
        "askSize": "11",
        "bidPrice": "8888.88",
        "bidSize": "5",
        "open24h": "9000",
        "high24h": "10000",
        "low24h": "8888.88",
        "volCurrency24h": "2222",
        "vol24h": "2222",
        "ts": "1597026383085"
    }]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | String | Successfully subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
data | Object | Subscribed data
`>instId` | String | Instrument ID
`>last` | String | Last traded price
`>lastSize` | String | Last traded size
`>askPrice` | String | Best ask price
`>askSize` | String | Best ask size
`>bidPrice` | String | Best bid price
`>bidSize` | String | Best bid size
`>open24h` | String | Open price in the past 24 hours
`>high24h` | String | Highest price in the past 24 hours
`>low24h` | String | Lowest price in the past 24 hours
`>volCurrency24h` | String | 24h trading volume, with a unit of base `currency`
`>vol24h` | String | 24h trading volume, with a unit of `contract`
`>ts` | String | Ticker data generation time. Unix timestamp format in milliseconds, e.g. `1597026383085`

### WS Funding Rate Channel

This channel uses public WebSocket and authentication is not required.

Retrieve the funding rate data of an instrument. The push frequency is the fastest interval 30 second push the data.


> Request Example
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"funding-rate",
            "instId":"BTC-USDT"
        }
    ]
}
```
#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `funding-rate`
`>instId` | String | Yes | Instrument ID


> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "funding-rate",
        "instId": "BTC-USDT"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"funding-rate\", \"instId\" : \"BTC-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | Object | Event, `subscribe` `unsubscribe` `error`
arg | String | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg": {
        "channel": "funding-rate",
        "instId": "BTC-USDT"
    },
    "data": [{
         "fundingRate":"0.0001875391284828",
         "fundingTime":"1700726400000",
         "instId":"BTC-USDT"
      }]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | String | Successfully subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
data | Object | Subscribed data
`>instId` | String | Instrument ID
`>fundingRate` | String | Current funding rate
`>fundingTime` | String | Funding time of the upcoming settlement, Unix timestamp format in milliseconds, e.g. `1597026383085`.

# Account
## REST API


### GET Balance

Retrieve the balances of all the assets and the amount that is available or on hold.

#### HTTP Request

`GET /api/v1/asset/balances`

> Request Example:
```shell
GET /api/v1/asset/balances?accountType=funding
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
accountType | String | Yes | Account type <br> `funding`/`futures`/`copy_trading`/`earn`/`spot`/`inverse_contract` <br> unified account use `futures`
currency | String | No | Currency

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "currency": "USDT",
            "balance": "10012514.919418081548717298",
            "available": "9872132.414278782284622898",
            "frozen": "138556.471805965930761067",
            "bonus": "0"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
currency | String | Currency
balance | String | Balance
frozen | String | Frozen balance
available | String | Available balance<br>The balance that can be withdrawn or transferred or used for trading
bonus | String | Bonus balance

### Funds Transfer

Only API Keys with `TRANSFER` privilege can call this endpoint.

This endpoint supports the transfer of funds between your accounts.

#### HTTP Request

`POST /api/v1/asset/transfer`

> Request Example:
```shell
POST /api/v1/asset/transfer
body
{
    "currency":"USDT",
    "amount":"1.5",
    "fromAccount":"funding",
    "toAccount":"futures",
    "clientId":"1211211"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
currency | String | Yes | Transfer currency, e.g. `USDT`
fromAccount | String | Yes | The remitting account <br>`funding`<br>`futures`<br>`copy_trading`<br>`earn`<br>`spot`<br>`inverse_contract`<br> unified account use `futures`
toAccount | String | Yes | The beneficiary account <br>`funding`<br>`futures`<br>`copy_trading`<br>`earn`<br>`spot`<br>`inverse_contract`<br> unified account use `futures`
amount | String | Yes | Amount to be transferred
clientId | String | No | Client-supplied ID<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "transferId": "3743",
        "clientTransferId": "1211211"
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
transferId | String | Transfer ID
clientId | String | Client-supplied ID

### GET Funds Transfer History

Query the funds transfer records.

#### HTTP Request

`GET /api/v1/asset/bills`

> Request Example:
```shell
GET /api/v1/asset/bills
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
currency | String | No | Transfer currency, e.g. `USDT`
fromAccount | String | No | The remitting account <br>`funding`<br>`futures`<br>`copy_trading`<br>`earn`<br>`spot`<br>`inverse_contract`<br> unified account use `futures`
toAccount | String | No | The beneficiary account <br>`funding`<br>`futures`<br>`copy_trading`<br>`earn`<br>`spot`<br>`inverse_contract`<br> unified account use `futures`
before | String | No | Pagination of data to return records newer than the requested ts, Unix timestamp format in milliseconds, e.g. `1656633600000`
after | String | No | Pagination of data to return records earlier than the requested ts, Unix timestamp format in milliseconds, e.g. `1654041600000`
limit | String | No | Number of results per request. The maximum is `100`; The default is `100`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "transferId": "3743",
            "currency": "USDT",
            "fromAccount": "futures",
            "toAccount": "funding",
            "amount": "1.000000000000000000",
            "ts": "1695264049618",
            "clientId": "cccc12121"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
currency | String | Transfer currency
fromAccount | String | The remitting account <br>`funding`<br>`futures`<br>`copy_trading`<br>`earn`<br>`spot`
toAccount | String | The beneficiary account <br>`funding`<br>`futures`<br>`copy_trading`<br>`earn`<br>`spot`
amount | String | Balance at the account level
ts | String | Creation time, Unix timestamp format in milliseconds, e.g.`1597026383085`
clientId | String | Client-supplied ID for transfer
transferId | String | Transfer ID

### GET Withdraw History

Retrieve the withdrawal records according to the currency, withdrawal status, and time range in reverse chronological order

#### HTTP Request

`GET /api/v1/asset/withdrawal-history`

> Request Example:
```shell
GET /api/v1/asset/withdrawal-history
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
currency | String | No | Currency, e.g. `USDT`
withdrawId | String | No | Withdrawal ID
txId | String | No | Hash record of the withdrawal
state | String | No | Status of withdrawal <br> `0`: waiting mannual review  <br> `2`: failed  <br> `3`: success <br> `4`: canceled<br> `6`: kyt<br> `7`: processing
before | String | No | Pagination of data to return records newer than the requested ts, Unix timestamp format in milliseconds, e.g. `1656633600000`
after | String | No | Pagination of data to return records earlier than the requested ts, Unix timestamp format in milliseconds, e.g. `1654041600000`
limit | String | No | Number of results per request. <br>The maximum is `100`; The default is `20`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "currency": "USDT",
            "chain": "TRC20",
            "address": "THmWeEJKyb976L76MvrTjeYMyNgiS9aKTu",
            "txId": "f7c47f3911a2f27f3b647c5ef4c09c9e7d3f69ab123456789abcdef0123456789",
            "type": "0",
            "amount": "40.011111",
            "fee": "0.1",
            "feeCurrency": "USDT",
            "state": "0",
            "clientId": null,
            "ts": "1695262311039",
            "tag": null,
            "memo": null,
            "withdrawId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
        },
        {
            "currency": "USDT",
            "chain": "TRC20",
            "address": "THmWeEJKyb976L76MvrTjeYMyNgiS9aKTu",
            "txId": "g8d58f4022b3f38f4c758d6ef5d10d0f8e4f70bc234567890bcdef1234567890",
            "type": "0",
            "amount": "9999.899",
            "fee": "0.1",
            "feeCurrency": "USDT",
            "state": "4",
            "clientId": null,
            "ts": "1695262311039",
            "tag": null,
            "memo": null,
            "withdrawId": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
currency | String | Withdraw currency
chain | String | Chain name, e.g. `ERC20`, `TRC20`
address | String | Receiving address
type | String | Withdraw type <br>`0`: blockchain withdraw <br>`1`: internal transfers
txId | String | Hash record of the withdrawal.
amount | String | Withdrawal amount
fee | String | Withdrawal fee amount
feeCurrency | String | Withdrawal fee currency, e.g. `USDT`
state | String | Status of withdrawal <br> `0`: waiting mannual review  <br> `2`: failed  <br> `3`: success <br> `4`: canceled<br> `6`: kyt<br> `7`: processing
clientId | String | Client-supplied ID
ts | String | Time the withdrawal request was submitted, Unix timestamp format in milliseconds, e.g. `1655251200000`.
tag | String | Some currencies require a tag for withdrawals. This is not returned if not required.
memo | String | Some currencies require this parameter for withdrawals. This is not returned if not required.
withdrawId | String | Withdrawal ID

### GET Deposit History

Retrieve the deposit records according to the currency, status, and time range in reverse chronological order

#### HTTP Request

`GET /api/v1/asset/deposit-history`

> Request Example:
```shell
GET /api/v1/asset/deposit-history
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
currency | String | No | Currency, e.g. `USDT`
depositId | String | No | Deposit ID
txId | String | No | Hash record of the deposit
state | String | No | Status of deposit <br> `0`: pending  <br> `1`: done  <br> `2`: failed  <br> `3`: kyt
before | String | No | Pagination of data to return records newer than the requested ts, Unix timestamp format in milliseconds, e.g. `1656633600000`
after | String | No | Pagination of data to return records earlier than the requested ts, Unix timestamp format in milliseconds, e.g. `1654041600000`
limit | String | No | Number of results per request. <br>The maximum is `100`; The default is `20`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "currency": "USDT",
            "chain": "TRC20",
            "address": "EXAMPLE_WALLET_ADDRESS",
            "txId": "h9e69f5133c4f49f5d869d7ef6e11e0f9f5f81cd345678901cdef2345678901",
            "type": "0",
            "amount": "9",
            "state": "1",
            "ts": "1597026383085",
            "confirm": "12",
            "depositId": "c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8"
        },
        {
            "currency": "USDT",
            "chain": "TRC20",
            "address": "EXAMPLE_WALLET_ADDRESS",
            "txId": "i0f70f6244d5f50f6e970e8ef7f22f1f0f6f92de456789012def3456789012",
            "type": "0",
            "amount": "9",
            "state": "1",
            "ts": "1597026383085",
            "confirm": "12",
            "depositId": "d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
currency | String | Currency
chain | String | Chain name, e.g. `ERC20`, `TRC20`
address | String | Deposit address
type | String | Deposit type <br>`0`: blockchain deposit <br>`1`: internal transfers
txId | String | Hash record of the deposit.
amount | String | Deposit amount
state | String | Status of deposit <br> `0`: pending  <br> `1`: done  <br> `2`: failed  <br> `3`: kyt
confirm | String | Confirmations
ts | String | Time the deposit request was submitted, Unix timestamp format in milliseconds, e.g. `1656633600000` 
depositId | String | Deposit ID

### Get Account Config

#### HTTP Request

`GET /api/v1/account/config`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "accountLevel": "0"
    }
}
```

#### Response Parameters

Parameter | Type | Description
----------------- | ----- | -----------
accountLevel | String | Account Level <br> `0`: normal  <br> `1`: spot <br> `2`: spot futures <br> `3`: multi currency <br> `0` is normal account <br> `1`/`2`/`3` is unified account

# Trading
## REST API
### GET Futures Account Balance

Retrieve a list of assets (with non-zero balance), remaining balance, and available amount in the futures account.

#### HTTP Request

`GET /api/v1/account/balance`

> Request Example:
```shell
GET /api/v1/account/balance
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
productType | String | No | Product Type <br> `USDT-FUTURES` <br> `COIN-FUTURES` <br> unified account use `USDT-FUTURES` <br> The default is `USDT-FUTURES`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "ts": "1697021343571",
        "totalEquity": "10011254.077985990315787910",
        "isolatedEquity": "861.763132108800000000",
        "details": [
            {
                "currency": "USDT",
                "equity": "10014042.988958415234430699548",
                "balance": "10013119.885958415234430699",
                "ts": "1697021343571",
                "isolatedEquity": "862.003200000000000000048",
                "available": "9996399.4708691159703362725",
                "availableEquity": "9996399.4708691159703362725",
                "frozen": "15805.149672632597427761",
                "orderFrozen": "14920.994472632597427761",
                "equityUsd": "10011254.077985990315787910",
                "isolatedUnrealizedPnl": "-22.151999999999999999952",
                "bonus": "0"
            }
        ]
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
ts | String | Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
totalEquity | String | The total amount of equity in USD
isolatedEquity | String | Isolated margin equity in USD
details | Array | Detailed asset information in all currencies
`>currency` | String | Currency
`>equity` | String | Equity of the currency
`>balance` | String | Cash balance
`>ts` | String | Update time of currency balance information, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>isolatedEquity` | String | Isolated margin equity of the currency
`>available` | String | Available balance of the currency
`>availableEquity` | String | Available equity of the currency
`>frozen` | String | Frozen balance of the currency
`>orderFrozen` | String | Margin frozen for open orders
`>equityUsd` | String | Equity in USD of the currency
`>isolatedUnrealizedPnl` | String | Isolated unrealized profit and loss of the currency
`>bonus` | String | Bonus balance

### GET Positions

Retrieve information on your positions.

#### HTTP Request

`GET /api/v1/account/positions`

> Request Example:
```shell
GET /api/v1/account/positions?instId=BTC-USDT
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "positionId": "7982",
            "instId": "ETH-USDT",
            "instType": "SWAP",
            "marginMode": "isolated",
            "positionSide": "net",
            "adl": "5",
            "positions": "1",
            "availablePositions": "1",
            "averagePrice": "1591.800000000000000000",
            "margin": "53.060000000000000000",
            "markPrice": "1591.69",
            "marginRatio": "72.453752328329172684",
            "liquidationPrice": "1066.104078762306610407",
            "unrealizedPnl": "-0.011",
            "unrealizedPnlRatio": "-0.000207312476441764",
            "maintenanceMargin": "0.636676",
            "createTime": "1695352782370",
            "updateTime": "1695352782372",
            "leverage": "3"
        },
        {
            "positionId": "5483",
            "instId": "BCH-USDT",
            "instType": "SWAP",
            "marginMode": "cross",
            "positionSide": "net",
            "adl": "5",
            "positions": "-290",
            "availablePositions": "-290",
            "averagePrice": "1890.000000000000000000",
            "markPrice": "1889",
            "marginRatio": "172426.851188979265788635",
            "liquidationPrice": "3418227.599542259480103079",
            "unrealizedPnl": "2.9",
            "unrealizedPnlRatio": "0.001587301587301587",
            "initialMargin": "1826.033333333333333333",
            "maintenanceMargin": "54.781",
            "createTime": "1695090016933",
            "updateTime": "1695090016931",
            "leverage": "3"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
positionId | String | Position ID
instId | String | Instrument ID, e.g. `BTC-USDT`
instType | String | Instrument type
marginMode | String | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Position side<br>`long`: `positions` is positive<br>`short`: `positions` is positive<br>`net` (Positive `positions` means long position and negative `positions` means short position.)
leverage | String | Leverage
positions | String | Quantity of positions
availablePositions | String | Position that can be closed
averagePrice | String | Average open price
markPrice | String | Latest Mark price
marginRatio | String | Margin ratio
liquidationPrice | String | Estimated liquidation price
unrealizedPnl | String | Unrealized profit and loss calculated by mark price.
unrealizedPnlRatio | String | Unrealized profit and loss ratio calculated by mark price.
initialMargin | String | Initial margin requirement, only applicable to `cross`.
maintenanceMargin | String | Maintenance margin requirement
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
updateTime | String | Latest time position was adjusted, Unix timestamp format in milliseconds, e.g. `1597026383085`

### GET Margin Mode

#### HTTP Request

`GET /api/v1/account/margin-mode`

> Request Example:
```shell
GET /api/v1/account/margin-mode
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
marginMode | String | Margin mode

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "marginMode": "isolated"
    }
}
```

### Set Margin Mode

#### HTTP Request

`POST /api/v1/account/set-margin-mode`

> Request Example:
```shell
{
    "marginMode": "isolated"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
marginMode | String | Margin mode

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "marginMode": "isolated"
    }
}
```

### GET Position Mode
Get user's position mode (Hedge Mode or One-way Mode) on every symbol

#### HTTP Request

`GET /api/v1/account/position-mode`

> Request Example:
```shell
GET /api/v1/account/position-mode
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
positionMode | String | Position mode <br> `net_mode`:   net<br> `long_short_mode`: long/short

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "positionMode": "net_mode"
    }
}
```

### Set Position Mode
Change user's position mode (Hedge Mode or One-way Mode) on every symbol

#### HTTP Request

`POST /api/v1/account/set-position-mode`

> Request Example:
```shell
{
    "positionMode": "net_mode"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
positionMode | String | Yes | Position mode <br> `net_mode`:   net<br> `long_short_mode`: long/short

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
positionMode | String | Position mode <br> `net_mode`:   net<br> `long_short_mode`: long/short

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "positionMode": "net_mode"
    }
}
```


### GET Leverage (Deprecated)
Deprecated,  if you are using it, please use  `GET Multiple Leverage` instead. 

#### HTTP Request

`GET /api/v1/account/leverage-info`

> Request Example:
```shell
GET /api/v1/account/leverage-info?instId=BTC-USDT&marginMode=cross
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "leverage": "3",
        "marginMode": "cross",
        "instId": "BCH-USDT"
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
instId | String | Instrument ID
leverage | String | Leverage
marginMode | String | Margin mode


### GET Multiple Leverage

#### HTTP Request
`GET /api/v1/account/batch-leverage-info`

> Request Example:
```shell
GET /api/v1/account/batch-leverage-info?instId=BTC-USDT,ETH-USDT&marginMode=cross
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID<br>Single instrument ID or multiple instrument IDs (no more than 20) separated with comma
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "leverage": "50",
            "marginMode": "cross",
            "instId": "BTC-USDT",
            "positionSide":"net"
        },
        {
            "leverage": "3",
            "marginMode": "cross",
            "instId": "ETH-USDT",
            "positionSide":"net"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
instId | String | Instrument ID
leverage | String | Leverage
marginMode | String | Margin mode
positionSide | String | Position side<br>`long`<br>`short`<br>`net`

### Set Leverage

#### HTTP Request

`POST /api/v1/account/set-leverage`

> Request Example:
```shell
{
    "instId":"BTC-USDT",
    "leverage":"100",
    "marginMode":"cross",
    "positionSide":"long"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
leverage | String | Yes | Leverage
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`
positionSide | String | No | Position side <br>`long` `short`<br>Only required when margin mode is `isolated` in `long/short` mode 

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "leverage": "100",
        "marginMode": "cross",
        "instId": "BTC-USDT",
        "positionSide":"long"
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
instId | String | Instrument ID
leverage | String | Leverage
marginMode | String | Margin mode
positionSide | String | Position side<br>`long`<br>`short`<br>`net`

### Place Order

#### HTTP Request

`POST /api/v1/trade/order`

> Request Example:
```shell
{
    "instId":"BTC-USDT",
    "marginMode":"cross",
    "positionSide":"long",
    "side":"sell",
    "price":"23212.2",
    "size":"2"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Yes | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
side | String | Yes | Order side, `buy` `sell`
orderType | String | Yes | Order type<br>`market`: market order<br>`limit`: limit order<br>`post_only`: Post-only order<br>`fok`: Fill-or-kill order<br>`ioc`: Immediate-or-cancel order
price | String | Yes | Order price. Not applicable to `market`
size | String | Yes | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
reduceOnly | String | No | Whether orders can only reduce in position size. <br>Valid options: `true` or `false`. The default value is `false`.<br>When `reduceOnly = true` and the opposite order size exceeds the position size. The position will be fully closed, and no new position will be opened.
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
tpTriggerPrice | String | No | Take-profit trigger price<br>If you fill in this parameter, you should fill in the `tpOrderPrice` as well.
tpOrderPrice | String | No | Take-profit order price.<br>If you fill in this parameter, you should fill in the `tpTriggerPrice` as well.<br>If the price is -1, take-profit will be executed at the market price.
slTriggerPrice | String | No | Stop-loss trigger price<br>If you fill in this parameter, you should fill in the `slOrderPrice` as well.
slOrderPrice | String | No | Stop-loss order price.<br>If you fill in this parameter, you should fill in the `slTriggerPrice` as well.<br>If the price is -1, stop-loss will be executed at the market price.
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.

> Response Example:

```json
{
    "code": "0",
    "msg": "",
    "data": [
        {
            "orderId": "28150801",
            "clientOrderId": "test1597321",
            "msg": "",
            "code": "0"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
clientOrderId | String | Client Order ID as assigned by the client
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.

### Place Multiple Orders

#### HTTP Request

`POST /api/v1/trade/batch-orders`

> Request Example:
```shell
[
  {
    "instId": "ETH-USDT",
    "marginMode": "cross",
    "positionSide": "net",
    "side": "buy",
    "orderType": "limit",
    "price": "1601.1",
    "size": "1",
    "reduceOnly": "false",
    "clientOrderId": "eeeeee11223112",
    "tpTriggerPrice": "",
    "tpOrderPrice": "",
    "slTriggerPrice": "",
    "slOrderPrice": ""
  },
  {
    "instId": "ETH-USDT",
    "marginMode": "cross",
    "positionSide": "net",
    "side": "buy",
    "orderType": "limit",
    "price": "1602.1",
    "size": "2",
    "reduceOnly": "false",
    "clientOrderId": "eeeeee1122321",
    "tpTriggerPrice": "",
    "tpOrderPrice": "",
    "slTriggerPrice": "",
    "slOrderPrice": ""
  }
]
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Yes | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
side | String | Yes | Order side, `buy` `sell`
orderType | String | Yes | Order type<br>`market`: market order<br>`limit`: limit order<br>`post_only`: Post-only order<br>`fok`: Fill-or-kill order<br>`ioc`: Immediate-or-cancel order
price | String | Yes | Order price. Not applicable to `market`
size | String | Yes | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
reduceOnly | String | No | Whether orders can only reduce in position size. <br>Valid options: `true` or `false`. The default value is `false`.<br>When `reduceOnly = true` and the opposite order size exceeds the position size. The position will be fully closed, and no new position will be opened.
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
tpTriggerPrice | String | No | Take-profit trigger price<br>If you fill in this parameter, you should fill in the `tpOrderPrice` as well.
tpOrderPrice | String | No | Take-profit order price.<br>If you fill in this parameter, you should fill in the `tpTriggerPrice` as well.<br>If the price is -1, take-profit will be executed at the market price.
slTriggerPrice | String | No | Stop-loss trigger price<br>If you fill in this parameter, you should fill in the `slOrderPrice` as well.
slOrderPrice | String | No | Stop-loss order price.<br>If you fill in this parameter, you should fill in the `slTriggerPrice` as well.<br>If the price is -1, stop-loss will be executed at the market price.
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "orderId": "22617453",
            "clientOrderId": "eeeeee11223112"
        },
        {
            "orderId": "22617454",
            "clientOrderId": "eeeeee1122321"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
clientOrderId | String | Client Order ID as assigned by the client
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.

### Place TPSL Order

#### HTTP Request

`POST /api/v1/trade/order-tpsl`

> Request Example:
```shell
{
  "instId": "ETH-USDT",
  "marginMode": "cross",
  "positionSide": "short",
  "side": "sell",
  "tpTriggerPrice": "1661.1",
  "tpOrderPrice": "",
  "slTriggerPrice": "",
  "slOrderPrice": "",
  "size": "1",
  "reduceOnly": "true",
  "clientOrderId": ""
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Yes | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
side | String | Yes | Order side, `buy` `sell`
tpTriggerPrice | String | Yes | Take-profit trigger price<br>If you fill in this parameter, you should fill in the `tpOrderPrice` as well.
tpOrderPrice | String | No | Take-profit order price.<br>If you fill in this parameter, you should fill in the `tpTriggerPrice` as well.<br>If the price is -1, take-profit will be executed at the market price.
slTriggerPrice | String | No | Stop-loss trigger price<br>If you fill in this parameter, you should fill in the `slOrderPrice` as well.
slOrderPrice | String | No | Stop-loss order price.<br>If you fill in this parameter, you should fill in the `slTriggerPrice` as well.<br>If the price is -1, stop-loss will be executed at the market price.
size | String | Yes | Quantity  <br> If the quantity is -1, it means entire positions
reduceOnly | String | No | Whether orders can only reduce in position size. <br>Valid options: `true` or `false`. The default value is `false`.<br>When `reduceOnly = true` and the opposite order size exceeds the position size. The position will be fully closed, and no new position will be opened.
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "tpslId": "1012",
        "clientOrderId": null,
        "code": "0",
        "msg": null
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
tpslId | String | TP/SL order ID
clientOrderId | String | Client Order ID as assigned by the client
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.



### Place Algo Order

#### HTTP Request

`POST /api/v1/trade/order-algo`

> Request Example:
```shell
POST /api/v1/trade/order-algo
body
{
  "instId": "ETH-USDT",
  "marginMode": "cross",
  "positionSide": "short",
  "side": "sell",
  "size": "1",
  "clientOrderId":""
  "orderPrice": "-1",
  "orderType": "trigger",
  "triggerPrice": "3000",
  "triggerPriceType": "last",
  "brokerId": "",
  "attachAlgoOrders": [{
        "tpTriggerPrice":"3500",
        "tpOrderPrice":"3600",
        "tpTriggerPriceType":"last",
        "slTriggerPrice":"2600",
        "slOrderPrice":"2500",
        "slTriggerPriceType":"last"
    }]
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- |----------| -----------
instId | String | Yes      | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Yes      | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Yes      | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
side | String | Yes      | Order side, `buy` `sell`
size | String | Yes      | Quantity  <br>If the quantity is `-1`, it means entire positions
clientOrderId | String | No       | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
orderType | String | Yes      |  Algo type, `trigger` 
orderPrice | String | No       | Order Price<br>If the price is `-1`, the order will be executed at the market price.
reduceOnly| String | No        | Whether the order can only reduce the position size. Valid options: true or false. The default value is false.
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


Trigger Order

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
triggerPrice | String | Yes | Trigger price
triggerPriceType | String | No | Trigger price type `last`: last price
attachAlgoOrders | Array of object | No | Attached SL/TP orders info Applicable to Spot and futures mode/Multi-currency margin/Portfolio margin
`>`tpTriggerPrice | String |No | Take-profit trigger price
`>`tpOrderPrice | String |No | Take-profit order price <br>If the price is `-1`, take-profit will be executed at the market price.
`>`tpTriggerPriceType | String |No | Trigger price type last: last price
`>`slTriggerPrice | String |No | Stop-loss trigger price 
`>`slOrderPrice | String |No |  Stop-loss order price <br>If the price is `-1`, stop-loss will be executed at the market price.
`>`slTriggerPriceType | String |No |  Stop-loss order trigger price type last: last price



> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "algoId": "1012",
        "clientOrderId": null,
        "code": "0",
        "msg": null
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
algoId | String | Algo order ID
clientOrderId | String | Client Order ID as assigned by the client
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.



### Cancel Order

#### HTTP Request

`POST /api/v1/trade/cancel-order`

> Request Example:
```shell
POST /api/v1/trade/cancel-order
body
{
  "orderId": "23209016"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
orderId | String | Yes | Order ID
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "orderId": "1012",
        "clientOrderId": null,
        "code": "0",
        "msg": null
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
clientOrderId | String | Client Order ID as assigned by the client
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.

### Cancel Multiple Orders

#### HTTP Request

`POST /api/v1/trade/cancel-batch-orders`

> Request Example:
```shell
POST /api/v1/trade/cancel-batch-orders
body
[
  {
    "instId": "ETH-USDT",
    "orderId": "22619976",
    "clientOrderId": ""
  },
  {
    "instId": "ETH-USDT",
    "orderId": "22619977",
    "clientOrderId": ""
  }
]
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
orderId | String | Yes | Order ID
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "orderId": "22619976",
            "clientOrderId": "eeeeee112231121"
        },
        {
            "orderId": "22619977",
            "clientOrderId": "eeeeee11223211"
        },
        {
            "orderId": "22619977111",
            "clientOrderId": null,
            "msg": "Cancel failed as the order has been filled, triggered, canceled or does not exist.",
            "code": "1000"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
clientOrderId | String | Client Order ID as assigned by the client
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.


### Cancel TPSL Order

#### HTTP Request

`POST /api/v1/trade/cancel-tpsl`

> Request Example:
```shell
POST /api/v1/trade/cancel-tpsl
body
[
  {
    "instId": "ETH-USDT",
    "tpslId": "22619976",
    "clientOrderId": ""
  },
  {
    "instId": "ETH-USDT",
    "tpslId": "22619977",
    "clientOrderId": ""
  }
]
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
tpslId | String | No | TP/SL order ID
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "tpslId": "1009",
            "clientOrderId": null,
            "code": "500",
            "msg": "Cancel failed as the order has been filled, triggered, canceled or does not exist."
        },
        {
            "tpslId": "1010",
            "clientOrderId": null,
            "code": "500",
            "msg": "Cancel failed as the order has been filled, triggered, canceled or does not exist."
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
clientOrderId | String | Client Order ID as assigned by the client
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.




### Cancel Algo Order

#### HTTP Request

`POST /api/v1/trade/cancel-algo`

> Request Example:
```shell
POST /api/v1/trade/cancel-algo
body
  {
    "instId": "ETH-USDT",
    "algoId": "22619976",
    "clientOrderId": ""
  }
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
algoId | String | No | Algo order ID
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": 
        {
            "algoId": "1009",
            "clientOrderId": null,
            "code": "500",
            "msg": "Cancel failed as the order has been filled, triggered, canceled or does not exist."
        }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
algoId | String | Algo order ID
clientOrderId | String | Client Order ID as assigned by the client
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.



### GET Active Orders

Retrieve all incomplete orders under the current account.

#### HTTP Request

`GET /api/v1/trade/orders-pending`

> Request Example:
```shell
GET /api/v1/trade/orders-pending
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
orderType | String | No | Order type<br>`market`: market order<br>`limit`: limit order<br>`post_only`: Post-only order<br>`fok`: Fill-or-kill order<br>`ioc`: Immediate-or-cancel order
state | String | No | State<br>`live`<br>`partially_filled`
after | String | No | Pagination of data to return records earlier than the requested `orderId`
before | String | No | Pagination of data to return records newer than the requested `orderId`
limit | String | No | Number of results per request. The maximum is `100`; The default is `20`

The `before` and `after` parameters cannot be used simultaneously.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "orderId": "29531103",
            "clientOrderId": "",
            "instId": "ETH-USDT",
            "marginMode": "isolated",
            "positionSide": "net",
            "side": "buy",
            "orderType": "limit",
            "price": "1514.150000000000000000",
            "size": "1.000000000000000000",
            "reduceOnly": "false",
            "leverage": "3",
            "state": "live",
            "filledSize": "0.000000000000000000",
            "filled_amount": "0.000000000000000000",
            "averagePrice": "0.000000000000000000",
            "fee": "0.000000000000000000",
            "pnl": "0.000000000000000000",
            "createTime": "1697031292762",
            "updateTime": "1697031292788",
            "orderCategory": "normal",
            "tpTriggerPrice": "1688.000000000000000000",
            "slTriggerPrice": "1299.000000000000000000",
            "slOrderPrice": null,
            "tpOrderPrice": null,
            "algoClientOrderId": "aaa",
            "algoId": "11756185",
            "brokerId": ""
        },
        {
            "orderId": "29530845",
            "clientOrderId": "",
            "instId": "ETH-USDT",
            "marginMode": "isolated",
            "positionSide": "net",
            "side": "buy",
            "orderType": "limit",
            "price": "1554.150000000000000000",
            "size": "2.000000000000000000",
            "reduceOnly": "false",
            "leverage": "3",
            "state": "live",
            "filledSize": "0.000000000000000000",
            "filled_amount": "0.000000000000000000",
            "averagePrice": "0.000000000000000000",
            "fee": "0.000000000000000000",
            "pnl": "0.000000000000000000",
            "createTime": "1697031251410",
            "updateTime": "1697031251430",
            "orderCategory": "normal",
            "tpTriggerPrice": null,
            "slTriggerPrice": null,
            "slOrderPrice": null,
            "tpOrderPrice": null,
            "algoClientOrderId": "",
            "algoId": "",
            "brokerId": ""
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
clientOrderId | String | Client Order ID as assigned by the client.
instId | String | Instrument ID
marginMode | String | Margin mode
positionSide | String | Position side
side | String | Order side
orderType | String | Order type
price | String | Price
size | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
reduceOnly | String | Whether orders can only reduce in position size.
leverage | String | Leverage
state | String | State
filledSize | String | Accumulated fill quantity.
averagePrice | String | Average filled price. If none is filled, it will return "".
fee | String | Fee and rebate
pnl | String | Profit and loss, Applicable to orders which have a trade and aim to close position.
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
updateTime | String | Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
orderCategory | String | Order category<br>`normal`<br>`full_liquidation`<br>`partial_liquidation`<br>`adl`<br>`tp`<br>`sl`
tpTriggerPrice | String | Take-profit trigger price
tpOrderPrice | String | Take-profit order price. <br>If the price is `-1`, take-profit will be executed at the market price.
slTriggerPrice | String | Stop-loss trigger price
slOrderPrice | String | Stop-loss order price. <br>If the price is `-1`, stop-loss will be executed at the market price.
algoClientOrderId | String | There will be a value when algo order attaching `clientOrderId` is triggered, or it will be "".
algoId | String | Algo ID. There will be a value when algo order is triggered, or it will be "".
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.

### GET Active TPSL Orders

Retrieve a list of untriggered TP/SL orders under the current account.

#### HTTP Request

`GET /api/v1/trade/orders-tpsl-pending`

> Request Example:
```shell
GET /api/v1/trade/orders-tpsl-pending
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
tpslId | String | No | TP/SL order ID
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
after | String | No | Pagination of data to return records earlier than the requested `tpslId`
before | String | No | Pagination of data to return records newer than the requested `tpslId`
limit | String | No | Number of results per request. The maximum is `100`; The default is `20`


The `before` and `after` parameters cannot be used simultaneously.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "tpslId": "2411",
            "instId": "ETH-USDT",
            "marginMode": "cross",
            "positionSide": "net",
            "side": "sell",
            "tpTriggerPrice": "1666.000000000000000000",
            "tpOrderPrice": null,
            "slTriggerPrice": "1222.000000000000000000",
            "slOrderPrice": null,
            "size": "1",
            "state": "live",
            "leverage": "3",
            "reduceOnly": "false",
            "actualSize": null,
            "clientOrderId": "aabbc",
            "createTime": "1697016700775",
            "brokerId": ""
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
tpslId | String | TP/SL order ID
clientOrderId | String | Client Order ID as assigned by the client.
instId | String | Instrument ID
marginMode | String | Margin mode
positionSide | String | Position side
side | String | Order side
tpTriggerPrice | String | Take-profit trigger price
tpOrderPrice | String | Take-profit order price. If the price is `-1`, take-profit will be executed at the market price.
slTriggerPrice | String | Stop-loss trigger price
slOrderPrice | String | Stop-loss order price. If the price is `-1`, stop-loss will be executed at the market price.
size | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
state | String | State,`live`, `effective`, `canceled`, `order_failed`
leverage | String | Leverage
reduceOnly | String | Whether orders can only reduce in position size.<br>Valid options: `true` or `false`. The default value is `false`.
actualSize | String | Actual order quantity
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.



### GET Active Algo Orders

Retrieve a list of untriggered algo orders under the current account.

#### HTTP Request

`GET /api/v1/trade/orders-algo-pending`

> Request Example:
```shell
GET /api/v1/trade/orders-algo-pending
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
algoId | String | No | Algo order ID
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
after | String | No | Pagination of data to return records earlier than the requested `algoId`
before | String | No | Pagination of data to return records newer than the requested `algoId`
limit | String | No | Number of results per request. The maximum is `100`; The default is `20`
orderType | String | Yes |  Algo type, `trigger` 



The `before` and `after` parameters cannot be used simultaneously.

> Response Example:

```json
{
  "code": "0",
  "msg": "success",
  "data": [
    {
      "algoId": "2101",
      "clientOrderId": "BBBBqqqq",
      "instId": "ETH-USDT",
      "marginMode": "cross",
      "positionSide": "net",
      "side": "sell",
      "orderType": "trigger",
      "size": "1",
      "leverage": "3",
      "state": "canceled",
      "triggerPrice": "1661.100000000000000000",
      "triggerPriceType": "last",
      "brokerId": "",
      "attachAlgoOrders": [
        {
          "tpTriggerPrice": "1666.000000000000000000",
          "tpOrderPrice": "-1",
          "tpTriggerPriceType": "last",
          "slTriggerPrice": "1222.000000000000000000",
          "slOrderPrice": "-1",
          "slTriggerPriceType": "last"
        }
      ]
    }
  ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
algoId | String | Algo order ID
clientOrderId | String | Client Order ID as assigned by the client.
instId | String | Instrument ID
marginMode | String | Margin mode
positionSide | String | Position side, `long`,`short`,`net`
side | String | Order side
orderType | String |  Algo type, `trigger` 
size | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
reduceOnly| String | Whether the order can only reduce the position size. Valid options: true or false. The default value is false.
leverage | String | Leverage
state | String | State, `live`, `effective`, `canceled`, `order_failed`
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085` 
triggerPrice | String | Trigger price
triggerPriceType | String | Trigger price type `last`: last price
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.
attachAlgoOrders | Array of object | Attached SL/TP orders info Applicable to Spot and futures mode/Multi-currency margin/Portfolio margin 
`>`tpTriggerPrice | String | Take-profit trigger price
`>`tpOrderPrice | String | Take-profit order price <br>If the price is `-1`, take-profit will be executed at the market price.
`>`tpTriggerPriceType | String | Trigger price type last: last price
`>`slTriggerPrice | String | Stop-loss trigger price 
`>`slOrderPrice | String |  Stop-loss order price <br>If the price is `-1`, stop-loss will be executed at the market price.
`>`slTriggerPriceType | String |  Stop-loss order trigger price type last: last price



### Close Positions

Close the position of an instrument via a market order.

#### HTTP Request

`POST /api/v1/trade/close-position`

> Request Example:
```shell
POST /api/v1/trade/close-position
body
{
    "instId":"BTC-USDT",
    "marginMode":"cross",
    "positionSide":"long",
    "clientOrderId":""
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Yes | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "instId": "ETH-USDT",
        "positionSide": "net",
        "clientOrderId": ""
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
instId | String | Instrument ID
clientOrderId | String | Client Order ID as assigned by the client
positionSide | String | Position side<br>`long`<br>`short`<br>`net`

### GET Order History

Get completed order history

#### HTTP Request

`GET /api/v1/trade/orders-history`

> Request Example:
```shell
GET /api/v1/trade/orders-history
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
orderType | String | No | Order type<br>`market`: market order<br>`limit`: limit order<br>`post_only`: Post-only order<br>`fok`: Fill-or-kill order<br>`ioc`: Immediate-or-cancel order
state | String | No | State<br>`canceled`<br>`filled`<br>`partially_canceled`  partially_canceled is the final state, if it is a closing order, pnl has value
after | String | No | Pagination of data to return records earlier than the requested `orderId`
before | String | No | Pagination of data to return records newer than the requested `orderId`
begin | String | No | Filter with a begin timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
end | String | No | Filter with an end timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
limit | String | No | Number of results per request. The maximum is `100`; The default is `20`

The `before` and `after` parameters cannot be used simultaneously.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "orderId": "29419717",
            "clientOrderId": "aabbc",
            "instId": "ETH-USDT",
            "marginMode": "cross",
            "positionSide": "net",
            "side": "buy",
            "orderType": "limit",
            "price": "1523.000000000000000000",
            "size": "1.000000000000000000",
            "reduceOnly": "false",
            "leverage": "3",
            "state": "canceled",
            "filledSize": "0.000000000000000000",
            "pnl": "0.000000000000000000",
            "averagePrice": "0.000000000000000000",
            "fee": "0.000000000000000000",
            "createTime": "1697010303781",
            "updateTime": "1697014607770",
            "orderCategory": "normal",
            "tpTriggerPrice": null,
            "tpOrderPrice": null,
            "slTriggerPrice": null,
            "slOrderPrice": null,
            "cancelSource": "user_canceled",
            "cancelSourceReason": "Order canceled by user",
            "algoClientOrderId": "aaa",
            "algoId": "11756185",
            "brokerId": ""
        },
        {
            "orderId": "29419496",
            "clientOrderId": "",
            "instId": "ETH-USDT",
            "marginMode": "cross",
            "positionSide": "net",
            "side": "buy",
            "orderType": "limit",
            "price": "1523.000000000000000000",
            "size": "1.000000000000000000",
            "reduceOnly": "false",
            "leverage": "3",
            "state": "canceled",
            "filledSize": "0.000000000000000000",
            "pnl": "0.000000000000000000",
            "averagePrice": "0.000000000000000000",
            "fee": "0.000000000000000000",
            "createTime": "1697010193531",
            "updateTime": "1697010227577",
            "orderCategory": "normal",
            "tpTriggerPrice": "1666.000000000000000000",
            "tpOrderPrice": null,
            "slTriggerPrice": "1100.000000000000000000",
            "slOrderPrice": null,
            "cancelSource": "user_canceled",
            "cancelSourceReason": "Order canceled by user",
            "algoClientOrderId": "",
            "algoId": "",
            "brokerId": ""
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
clientOrderId | String | Client Order ID as assigned by the client.
instId | String | Instrument ID
marginMode | String | Margin mode
positionSide | String | Position side
side | String | Order side
orderType | String | Order type
price | String | Price
size | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
reduceOnly | String | Whether orders can only reduce in position size.
leverage | String | Leverage
state | String | State
filledSize | String | Accumulated fill quantity.
pnl | String | Profit and loss, Applicable to orders which have a trade and aim to close position.
averagePrice | String | Average filled price. If none is filled, it will return "".
fee | String | Fee and rebate
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
updateTime | String | Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
orderCategory | String | Order category<br>`normal`<br>`full_liquidation`<br>`partial_liquidation`<br>`adl`<br>`tp`<br>`sl`
tpTriggerPrice | String | Take-profit trigger price
tpOrderPrice | String | Take-profit order price. If the price is `-1`, take-profit will be executed at the market price.
slTriggerPrice | String | Stop-loss trigger price
slOrderPrice | String | Stop-loss order price. If the price is `-1`, stop-loss will be executed at the market price.
cancelSource | String | Type of the cancellation source.
cancelSourceReason | String | Reason for the cancellation.
algoClientOrderId | String | There will be a value when algo order attaching `clientOrderId` is triggered, or it will be "".
algoId | String | Algo ID. There will be a value when algo order is triggered, or it will be "".
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.

### GET TPSL Order History

Retrieve a list of all TP/SL orders under the current account.

#### HTTP Request

`GET /api/v1/trade/orders-tpsl-history`

> Request Example:
```shell
GET /api/v1/trade/orders-tpsl-history
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
tpslId | String | No | TP/SL order ID
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
state | String | No | State,`live`, `effective`, `canceled`, `order_failed`
after | String | No | Pagination of data to return records earlier than the requested `tpslId`
before | String | No | Pagination of data to return records newer than the requested `tpslId`
limit | String | No | Number of results per request. The maximum is `100`; The default is `20`


The `before` and `after` parameters cannot be used simultaneously.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "tpslId": "2101",
            "clientOrderId": "BBBBqqqq",
            "instId": "ETH-USDT",
            "marginMode": "cross",
            "positionSide": "net",
            "side": "sell",
            "orderType": null,
            "size": "1",
            "reduceOnly": "true",
            "leverage": "3",
            "state": "canceled",
            "actualSize": null,
            "triggerType": null,
            "orderCategory": "normal",
            "tpTriggerPrice": "1661.100000000000000000",
            "tpOrderPrice": null,
            "slTriggerPrice": null,
            "slOrderPrice": null,
            "brokerId": ""
        },
        {
            "tpslId": "1482",
            "clientOrderId": "",
            "instId": "ETH-USDT",
            "marginMode": "cross",
            "positionSide": "net",
            "side": "sell",
            "orderType": null,
            "size": "1",
            "reduceOnly": "true",
            "leverage": "3",
            "state": "canceled",
            "actualSize": null,
            "orderCategory": "normal",
            "tpTriggerPrice": "1661.100000000000000000",
            "tpOrderPrice": null,
            "slTriggerPrice": null,
            "slOrderPrice": null,
            "brokerId": ""
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
tpslId | String | TP/SL order ID
clientOrderId | String | Client Order ID as assigned by the client.
instId | String | Instrument ID
marginMode | String | Margin mode
positionSide | String | Position side, `long`,`short`,`net`
side | String | Order side
orderType | String | Order type<br>`market`: market order<br>`limit`: limit order<br>`post_only`: Post-only order<br>`fok`: Fill-or-kill order<br>`ioc`: Immediate-or-cancel order
size | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
reduceOnly | String | Whether orders can only reduce in position size.<br>Valid options: `true` or `false`. The default value is `false`.
leverage | String | Leverage
state | String | State,`live`, `effective`, `canceled`, `order_failed`
actualSize | String | Actual order quantity
orderCategory | String | Order category<br>`normal`<br>`full_liquidation`<br>`partial_liquidation`<br>`adl`<br>`tp`<br>`sl`
tpTriggerPrice | String | Take-profit trigger price
tpOrderPrice | String | Take-profit order price. If the price is `-1`, take-profit will be executed at the market price.
slTriggerPrice | String | Stop-loss trigger price
slOrderPrice | String | Stop-loss order price. If the price is `-1`, stop-loss will be executed at the market price.
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.





### GET Algo Order History

Retrieve a list of all Algo orders under the current account.

#### HTTP Request

`GET /api/v1/trade/orders-algo-history`

> Request Example:
```shell
GET /api/v1/trade/orders-algo-history
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
algoId | String | No | Algo order ID
clientOrderId | String | No | Client Order ID as assigned by the client<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters.
state | String | No | State,`live`, `effective`, `canceled`, `order_failed`
after | String | No | Pagination of data to return records earlier than the requested `algoId`
before | String | No | Pagination of data to return records newer than the requested `algoId`
limit | String | No | Number of results per request. The maximum is `100`; The default is `20`
orderType | String | Yes |  Algo type, `trigger` 


The `before` and `after` parameters cannot be used simultaneously.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "algoId": "2101",
            "clientOrderId": "BBBBqqqq",
            "instId": "ETH-USDT",
            "marginMode": "cross",
            "positionSide": "net",
            "side": "sell",
            "orderType": "trigger",
            "size": "1",
            "actualSize": "1",
            "leverage": "3",
            "state": "canceled", 
            "triggerPrice": "1661.100000000000000000",
            "triggerPriceType": "last",
            "brokerId": "",
            "attachAlgoOrders": [
                {
                    "tpTriggerPrice": "1666.000000000000000000",
                    "tpOrderPrice": "-1",
                    "tpTriggerPriceType": "last",
                    "slTriggerPrice": "1222.000000000000000000",
                    "slOrderPrice": "-1",
                    "slTriggerPriceType": "last"
                }
            ]
        }
    ]
}
```

#### Response Parameters
Parameter | Type   | Description                          
----------------- |--------|--------------------------------------
algoId | String | Algo order ID                        
clientOrderId | String | Client Order ID as assigned by the client. 
instId | String | Instrument ID                        
marginMode | String | Margin mode                          
positionSide | String | Position side, `long`,`short`,`net`  
side | String | Order side                           
reduceOnly| String | Whether the order can only reduce the position size. Valid options: true or false. The default value is false.
orderType | String |  Algo type, `trigger` 
size | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
leverage | String | Leverage
state | String | State,`live`, `effective`, `canceled`, `order_failed`
actualSize | String | Actual order quantity
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085` 
triggerPrice | String | Trigger price
triggerPriceType | String | Trigger price type `last`: last price
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.
attachAlgoOrders | Array of object | Attached SL/TP orders info Applicable to Spot and futures mode/Multi-currency margin/Portfolio margin
`>`tpTriggerPrice | String | Take-profit trigger price
`>`tpOrderPrice | String | Take-profit  order price <br>If the price is `-1`, stop-loss will be executed at the market price.
`>`tpTriggerPriceType | String | Trigger price type last: last price
`>`slTriggerPrice | String | Stop-loss trigger price 
`>`slOrderPrice | String |  Stop-loss order price  <br>If the price is `-1`, stop-loss will be executed at the market price.
`>`slTriggerPriceType | String |  Stop-loss order trigger price type last: last price



### GET Trade History

Retrieve recently-filled transaction details.

#### HTTP Request

`GET /api/v1/trade/fills-history`

> Request Example:
```shell
GET /api/v1/trade/fills-history
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
orderId | String | No | Order ID
after | String | No | Pagination of data to return records earlier than the requested `tradeId`
before | String | No | Pagination of data to return records newer than the requested `tradeId`
begin | String | No | Filter with a begin timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
end | String | No | Filter with an end timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
limit | String | No | Number of results per request. The maximum is `100`; The default is `20`

The `before` and `after` parameters cannot be used simultaneously.

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "instId": "ETH-USDT",
            "tradeId": "7772187",
            "orderId": "28697026",
            "fillPrice": "1587.800000000000000000",
            "fillSize": "2.000000000000000000",
            "fillPnl": "0.000000000000000000",
            "positionSide": "long",
            "side": "buy",
            "fee": "0.190536000000000000",
            "ts": "1696853354238",
            "brokerId": ""
        },
        {
            "instId": "ETH-USDT",
            "tradeId": "7772186",
            "orderId": "28697025",
            "fillPrice": "1587.800000000000000000",
            "fillSize": "1.000000000000000000",
            "fillPnl": "0.000000000000000000",
            "positionSide": "short",
            "side": "buy",
            "fee": "0.095268000000000000",
            "ts": "1696853354224",
            "brokerId": ""
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
instId | String | Instrument ID
tradeId | String | Trade ID
orderId | String | Order ID
fillPrice | String | filled price
fillSize | String | Filled quantity
fillPnl | String | Last filled profit and loss, applicable to orders which have a trade and aim to close position.
positionSide | String | Position side, `long`,`short`,`net`
side | String | Order side
fee | String | Fee
ts | String | Data generation time, Unix timestamp format in milliseconds, e.g. `1597026383085`.
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.



### GET Trade Order Price Range

Query price limit range

#### HTTP Request

`GET /api/v1/trade/order/price-range`

> Request Example:
```shell
GET /api/v1/trade/order/price-range
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
side | String | Yes | Order side, `buy` `sell`



> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data":  {
            "maxPrice": "1587.800000000000000000",
            "minPrice": "1187.000000000000000000"
        }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
maxPrice | String | Maximum Price
minPrice | String | Minimum Price


## WebSocket
### WS Positions Channel

This channel uses private WebSocket and authentication is required.

Retrieve position information. Initial snapshot will be pushed according to subscription granularity. Data will be pushed when triggered by events such as placing/canceling order, and will also be pushed in regular interval according to subscription granularity.

> Request Example: Single
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"positions",
            "instId":"ETH-USDT"
        }
    ]
}
```
> Request Example: 
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"positions"
        }
    ]
}
```

#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `positions`
`>instId` | String | No | Instrument ID


> Response Example: Single

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "positions",
        "instId": "ETH-USDT"
    }
}
```
> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "positions"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"positions\", \"instId\" : \"ETH-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | String | Event, `subscribe` `unsubscribe` `error`
arg | Object | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg":{
        "channel":"positions"
    },
    "data":[
        {
            "instType":"SWAP",
            "instId":"BNB-USDT",
            "marginMode":"cross",
            "positionId":"8138",
            "positionSide":"net",
            "positions":"-100",
            "availablePositions":"-100",
            "averagePrice":"130.06",
            "unrealizedPnl":"-77.1",
            "unrealizedPnlRatio":"-1.778409964631708442",
            "leverage":"3",
            "liquidationPrice":"107929.699398660166170462",
            "markPrice":"207.16",
            "initialMargin":"69.053333333333333333",
            "margin":"",
            "marginRatio":"131.337873621866389829",
            "maintenanceMargin":"1.0358",
            "adl":"3",
            "createTime":"1695795726481",
            "updateTime":"1695795726484"
        }
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | Object | Successfully subscribed channel
`>channel` | String | Channel name
data | Array | Subscribed data
`>instId` | String | Instrument ID, e.g. `BTC-USDT`
`>instType` | String | Instrument type
`>marginMode` | String | Margin mode<br>`cross`<br>`isolated`
`>positionId` | String | Position ID
`>positionSide` | String | Position side<br>`long`<br>`short`<br>`net` (Positive `position` means long position and negative `position` means short position.)
`>positions` | String | Quantity of positions
`>availablePositions` | String | Position that can be closed
`>averagePrice` | String | Average open price
`>unrealizedPnl` | String | Unrealized profit and loss calculated by mark price.
`>unrealizedPnlRatio` | String | Unrealized profit and loss ratio calculated by mark price.
`>leverage` | String | Leverage
`>liquidationPrice` | String | Estimated liquidation price
`>markPrice` | String | Latest Mark price
`>initialMargin` | String | Initial margin requirement, only applicable to `cross`.
`>margin` | String | Margin, can be added or reduced.
`>marginRatio` | String | Margin ratio
`>maintenanceMargin` | String | Maintenance margin requirement
`>adl` | String | Auto decrease line, signal area<br>Divided into 5 levels, from 1 to 5, the smaller the number, the weaker the adl intensity.
`>createTime` | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>updateTime` | String | Latest time position was adjusted, Unix timestamp format in milliseconds, e.g. `1597026383085`

### WS Order Channel

This channel uses private WebSocket and authentication is required.

Retrieve order information. Data will not be pushed when first subscribed. Data will only be pushed when there are order updates.

> Request Example: Single
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"orders",
            "instId":"ETH-USDT"
        }
    ]
}
```
> Request Example: 
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"orders"
        }
    ]
}
```

#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `orders`
`>instId` | String | No | Instrument ID


> Response Example: Single

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "orders",
        "instId": "ETH-USDT"
    }
}
```
> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "orders"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"orders\", \"instId\" : \"ETH-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | String | Event, `subscribe` `unsubscribe` `error`
args | Object | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "action":"snapshot",
    "arg":{
        "channel":"orders"
    },
    "data":[
        {
            "instType":"SWAP",
            "instId":"BTC-USDT",
            "orderId":"28334314",
            "clientOrderId":null,
            "price":"28000.000000000000000000",
            "size":"10",
            "orderType":"limit",
            "side":"sell",
            "positionSide":"net",
            "marginMode":"cross",
            "filledSize":"0",
            "filledAmount":"0.000000000000000000",
            "averagePrice":"0.000000000000000000",
            "state":"live",
            "leverage":"2",
            "tpTriggerPrice":"27000.000000000000000000",
            "tpTriggerPriceType":"last",
            "tpOrderPrice":"-1",
            "slTriggerPrice":null,
            "slTriggerPriceType":null,
            "slOrderPrice":null,
            "fee":"0.000000000000000000",
            "pnl":"0.000000000000000000",
            "cancelSource":"",
            "orderCategory":"pre_tp_sl",
            "createTime":"1696760245931",
            "updateTime":"1696760245973",
            "reduceOnly":"false",
            "brokerId":""
        }
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
action | String | Push data action, incremental data or full snapshot.<br>`snapshot`: full<br>`update`: incremental
arg | Object | Successfully subscribed channel
`>channel` | String | Channel name
data | Array | Subscribed data
`>instId` | String | Instrument ID, e.g. `BTC-USDT`
`>instType` | String | Instrument type
`>orderId` | String | Order ID
`>clientOrderId` | String | Client Order ID as assigned by the client.
`>price` | String | Price
`>size` | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
`>orderType` | String | Order type
`>side` | String | Order side
`>positionSide` | String | Position side
`>marginMode` | String | Margin mode
`>filledSize` | String | Accumulated fill quantity
`>filledAmount` | String | 
`>averagePrice` | String | Average filled price. If none is filled, it will return "".
`>state` | String | State
`>leverage` | String | Leverage
`>tpTriggerPrice` | String | Take-profit trigger price
`>triggerPriceType` | String | Trigger price type of take-profit and stop-loss.`last`
`>tpOrderPrice` | String | Take-profit order price. If the price is `-1`, take-profit will be executed at the market price.
`>slTriggerPrice` | String | Stop-loss trigger price
`>slOrderPrice` | String | Stop-loss order price. If the price is `-1`, stop-loss will be executed at the market price.
`>fee` | String | Fee and rebate
`>pnl` | String | Profit and loss, Applicable to orders which have a trade and aim to close position.
`>cancelSource` | String | 
`>orderCategory` | String | Order category<br>`normal`<br>`full_liquidation`<br>`partial_liquidation`<br>`adl`<br>`tp`<br>`sl`
`>createTime` | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>updateTime` | String | Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>reduceOnly` | String | Whether orders can only reduce in position size.
`>brokerId` | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


### WS Algo Orders Channel

This channel uses private WebSocket and authentication is required.

Retrieve algo orders (includes `trigger` order, `TP/SL` order). Data will not be pushed when first subscribed. Data will only be pushed when there are order updates.

> Request Example: Single
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"orders-algo",
            "instId":"ETH-USDT"
        }
    ]
}
```
> Request Example: 
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"orders-algo"
        }
    ]
}
```

#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `orders-algo`
`>instId` | String | No | Instrument ID


> Response Example: Single

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "orders-algo",
        "instId": "ETH-USDT"
    }
}
```
> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "orders-algo"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"orders-algo\", \"instId\" : \"ETH-USDT\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | String | Event, `subscribe` `unsubscribe` `error`
args | Object | Subscribed channel
`>channel` | String | Channel name
`>instId` | String | Instrument ID
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "action": "snapshot",
    "arg": {
        "channel": "orders-algo"
    },
    "data": [
        {
            "instType": "SWAP",
            "instId": "BTC-USDT",
            "tpslId": "11779982",
            "algoId": "11779982",
            "clientOrderId": "",
            "size": "100",
            "orderType": "conditional",
            "side": "buy",
            "positionSide": "long",
            "marginMode": "cross",
            "leverage": "10",
            "state": "live",
            "tpTriggerPrice": "73000.000000000000000000",
            "tpOrderPrice": "-1",
            "slTriggerPrice": null,
            "slOrderPrice": null,
            "triggerPrice": null,
            "triggerPriceType": "last",
            "orderPrice": null,
            "actualSize": "",
            "actualSide": "",
            "reduceOnly": "false",
            "cancelType": "not_canceled",
            "createTime": "1731056529341",
            "updateTime": "1731056529341",
            "brokerId": ""
        },
        {
            "instType": "SWAP",
            "instId": "BTC-USDT",
            "tpslId": "11779984",
            "algoId": "11779984",
            "clientOrderId": "",
            "size": "100",
            "orderType": "trigger",
            "side": "buy",
            "positionSide": "long",
            "marginMode": "cross",
            "leverage": "10",
            "state": "live",
            "tpTriggerPrice": null,
            "tpOrderPrice": null,
            "slTriggerPrice": null,
            "slOrderPrice": null,
            "triggerPrice": "73000.000000000000000000",
            "triggerPriceType": "last",
            "orderPrice": "-1",
            "actualSize": "",
            "actualSide": null,
            "reduceOnly": "false",
            "cancelType": "not_canceled",
            "createTime": "1731057086771",
            "updateTime": "1731057086771",
            "brokerId": "",
            "attachAlgoOrders": [
                {
                    "tpTriggerPrice": "75000",
                    "tpTriggerPriceType": "market",
                    "tpOrderPrice": "-1",
                    "slTriggerPriceType": null,
                    "slTriggerPrice": null,
                    "slOrderPrice": null
                }
            ]
        }
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
action | String | Push data action, incremental data or full snapshot.<br>`snapshot`: full<br>`update`: incremental
arg | Object | Successfully subscribed channel
`>channel` | String | Channel name
data | Array | Subscribed data
`>instId` | String | Instrument ID, e.g. `BTC-USDT`
`>instType` | String | Instrument type
`>algoId` | String | Algo ID
`>clientOrderId` | String | Client Order ID as assigned by the client.
`>size` | String | Quantity to buy or sell
`>orderType` | String | Order type<br>`conditional`: One-way stop order<br>`trigger`: Trigger order
`>side` | String | Order side<br>`buy`<br>`sell`
`>positionSide` | String | Position side
`>marginMode` | String | Margin mode
`>leverage` | String | Leverage
`>state` | String | State<br>`live`: to be effective<br>`effective`: effective<br>`canceled`: canceled<br>`order_failed`: order failed
`>tpTriggerPrice` | String | Take-profit trigger price
`>tpOrderPrice` | String | Take-profit order price. If the price is `-1`, take-profit will be executed at the market price.
`>slTriggerPrice` | String | Stop-loss trigger price
`>slOrderPrice` | String | Stop-loss order price. If the price is `-1`, stop-loss will be executed at the market price.
`>triggerPrice` | String | Trigger price
`>triggerPriceType` | String | Trigger price type.<br>`last`: last price<br>`index`: index price<br>`mark`: mark price
`orderPrice` | String | Order price for the trigger order
`>actualSize` | String | Actual order quantity
`>actualSide` | String | Actual order side<br>`sl`: stop loss<br>`tp`: take profit<br>Only applicable to `conditional` order
`>reduceOnly` | String | Whether orders can only reduce in position size.
`>cancelType` | String | Type of the cancellation source.<br>`not_canceled` <br>`user_canceled` <br>`system_canceled`
`>createTime` | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>updateTime` | String | Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>tag` | String | Order tag
`>brokerId` | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.
`>attachAlgoOrds` | String | Attached TP/SL orders info
`>> tpTriggerPrice` | String | Take-profit trigger price<br>If you fill in this parameter, you should fill in the take-profit order price as well.
`>> tpTriggerPriceType` | String | Take-profit trigger price type<br>`last`: last price<br>`index`: index price<br>`mark`: mark price
`>> tpOrderPrice` | String | Take-profit order price<br>If you fill in this parameter, you should fill in the take-profit trigger price as well.<br>If the price is `-1`, take-profit will be executed at the market price.
`>> slTriggerPrice` | String | Stop-loss trigger price<br>If you fill in this parameter, you should fill in the stop-loss order price as well.
`>> slTriggerPriceType` | String | Stop-loss trigger price type<br>`last`: last price<br>`index`: index price<br>`mark`: mark price
`>> slOrderPrice` | String | Stop-loss order price<br>If you fill in this parameter, you should fill in the stop-loss trigger price.<br>If the price is `-1`, stop-loss will be executed at the market price.

### WS Account Channel

This channel uses private WebSocket and authentication is required.

Retrieve account information. Data will be pushed when triggered by events such as placing order, canceling order, transaction execution, etc. It will also be pushed in regular interval according to subscription granularity.

> Request Example: Single
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"account"
        }
    ]
}
```

#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe` `error`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `account`

> Response Example: Single

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "account"
    }
}
```
> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "account"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"account\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | String | Event, `subscribe` `unsubscribe` `error`
args | Object | Subscribed channel
`>channel` | String | Channel name
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
  "arg": {
    "channel": "account"
  },
  "data": {
    "ts": "1597026383085",
    "totalEquity": "41624.32",
    "isolatedEquity": "3624.32",
    "details": [
      {
        "currency": "USDT",
        "equity": "1",
        "balance": "1",
        "ts": "1617279471503",
        "isolatedEquity": "0",
        "equityUsd": "45078.3790756226851775",
        "availableEquity": "1",
        "available": "0",
        "frozen": "0",
        "orderFrozen": "0",
        "unrealizedPnl": "0",
        "isolatedUnrealizedPnl": "0",
        
      }
    ]
  }
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | Object | Successfully subscribed channel
`>channel` | String | Channel name
data | Object | Subscribed data
`>ts` | String |  Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>totalEquity` | String | The total amount of equity in USD
`>isolatedEquity` | String | Isolated margin equity in USD
`>details` | String | Detailed asset information in all currencies
`>>currency` | String | Currency
`>>equity` | String | Equity of the currency
`>>balance` | String | Cash balance
`>>ts` | String | Update time of currency balance information, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>>isolatedEquity` | String | Isolated margin equity of the currency
`>>available` | String | Available balance of the currency
`>>availableEquity` | String | Available equity of the currency
`>>frozen` | String | Frozen balance of the currency
`>>orderFrozen` | String | Margin frozen for open orders
`>>equityUsd` | String | Equity in USD of the currency
`>>isolatedUnrealizedPnl` | String | Isolated unrealized profit and loss of the currency
`>>coinUsdPrice` | String | Price index USD of currency
`>>spotAvailable` | String | Spot balance of the currency
`>>liability` | String | Liabilities of currency, Applicable to `Multi-currency margin`
`>>borrowFrozen` | String | Potential borrowing IMR of currency in USD. Only applicable to `Multi-currency margin`. It is "" for other margin modes.
`>>marginRatio` | String | Cross maintenance margin requirement at the currency level. Applicable to `Multi-currency margin` and when there is cross position

### WS Inverse Account Channel

This channel uses private WebSocket and authentication is required.

Retrieve account information. Data will be pushed when triggered by events such as placing order, canceling order, transaction execution, etc. It will also be pushed in regular interval according to subscription granularity.

> Request Example: Single
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"inverse-account"
        }
    ]
}
```

#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe` `error`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `inverse-account`

> Response Example: Single

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "inverse-account"
    }
}
```
> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "inverse-account"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"inverse-account\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | String | Event, `subscribe` `unsubscribe` `error`
args | Object | Subscribed channel
`>channel` | String | Channel name
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
  "arg": {
    "channel": "inverse-account"
  },
  "data": {
    "ts": "1597026383085",
    "details": [
      {
        "currency": "BTC",
        "equity": "1",
        "balance": "1",
        "ts": "1617279471503",
        "isolatedEquity": "0",
        "equityUsd": "45078.3790756226851775",
        "availableEquity": "1",
        "available": "0",
        "frozen": "0",
        "orderFrozen": "0",
        "unrealizedPnl": "0",
        "isolatedUnrealizedPnl": "0",
        
      }
    ]
  }
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | Object | Successfully subscribed channel
`>channel` | String | Channel name
data | Object | Subscribed data
`>ts` | String |  Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>details` | String | Detailed asset information in all currencies
`>>currency` | String | Currency
`>>equity` | String | Equity of the currency
`>>balance` | String | Cash balance
`>>ts` | String | Update time of currency balance information, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>>isolatedEquity` | String | Isolated margin equity of the currency
`>>available` | String | Available balance of the currency
`>>availableEquity` | String | Available equity of the currency
`>>frozen` | String | Frozen balance of the currency
`>>orderFrozen` | String | Margin frozen for open orders
`>>equityUsd` | String | Equity in USD of the currency
`>>isolatedUnrealizedPnl` | String | Isolated unrealized profit and loss of the currency
`>>coinUsdPrice` | String | Price index USD of currency
`>>spotAvailable` | String | Spot balance of the currency
`>>liability` | String | Liabilities of currency, Applicable to `Multi-currency margin`
`>>borrowFrozen` | String | Potential borrowing IMR of currency in USD. Only applicable to `Multi-currency margin`. It is "" for other margin modes.
`>>marginRatio` | String | Cross maintenance margin requirement at the currency level. Applicable to `Multi-currency margin` and when there is cross position

## Complete Trading Example

This section demonstrates a complete trading workflow that combines REST API calls with WebSocket updates. The example shows how to:
1. Query the order book to get current price
2. Place a limit buy order 10% below market price
3. Receive order confirmation via WebSocket
4. Cancel the order and clean up resources

### Python Implementation

```python
import asyncio
import base64
import hmac
import hashlib
import json
import requests
import time
import websockets

async def sign_websocket_login(secret: str, api_key: str, passphrase: str) -> tuple[str, str, str]:
    """Generate WebSocket login signature."""
    timestamp = str(int(time.time() * 1000))
    nonce = timestamp
    
    # Fixed components for WebSocket auth
    method = "GET"
    path = "/users/self/verify"
    body = ""
    
    # Create signature string
    msg = f"{path}{method}{timestamp}{nonce}{body}"
    hex_signature = hmac.new(
        secret.encode(),
        msg.encode(),
        hashlib.sha256
    ).hexdigest().encode()
    
    return base64.b64encode(hex_signature).decode(), timestamp, nonce

async def trading_example():
    """Complete trading workflow example."""
    try:
        # Example credentials (replace with your own)
        api_key = "YOUR_API_KEY"
        secret = "YOUR_SECRET"
        passphrase = "YOUR_PASSPHRASE"
        
        # 1. Get order book price
        response = requests.get(
            "https://openapi.blofin.com/api/v1/market/books",
            params={"instId": "BTC-USDT", "size": "1"}
        )
        response.raise_for_status()
        best_ask = float(response.json()["data"][0]["asks"][0][0])  # Note: data[0] for first order book entry
        limit_price = round(best_ask * 0.9, 1)  # 10% below market, rounded to 0.1
        print(f"Best ask: {best_ask}, Limit price: {limit_price}")
        
        # 2. Connect to WebSocket and authenticate
        ws = await websockets.connect("wss://openapi.blofin.com/ws/private")
        sign, timestamp, nonce = await sign_websocket_login(secret, api_key, passphrase)
        
        # Login
        await ws.send(json.dumps({
            "op": "login",
            "args": [{
                "apiKey": api_key,
                "passphrase": passphrase,
                "timestamp": timestamp,
                "sign": sign,
                "nonce": nonce
            }]
        }))

        await asyncio.sleep(1)
        # Subscribe to orders channel
        await ws.send(json.dumps({
            "op": "subscribe",
            "args": [{"channel": "orders", "instId": "BTC-USDT"}]
        }))
        
        # 3. Place limit buy order
        order_request = {
            "instId": "BTC-USDT",
            "marginMode": "cross",
            "side": "buy",
            "orderType": "limit", 
            "price": str(limit_price),
            "size": "0.1",  # See /api/v1/market/instruments for contract sizes
            "leverage": "3",
            "positionSide": "net"
        }
        # order_request["brokerId"] = "your broker id" #if needed
        # Generate signature for REST API
        timestamp = str(int(time.time() * 1000))
        nonce = timestamp  # Use timestamp as nonce for consistency
        path = "/api/v1/trade/order"
        method = "POST"
        msg = f"{path}{method}{timestamp}{nonce}{json.dumps(order_request)}"
        hex_signature = hmac.new(
            secret.encode('utf-8'),
            msg.encode('utf-8'),
            hashlib.sha256
        ).hexdigest().encode('utf-8')
        signature = base64.b64encode(hex_signature).decode()
        
        # Prepare headers with broker ID
        headers = {
            "ACCESS-KEY": api_key,
            "ACCESS-SIGN": signature,
            "ACCESS-TIMESTAMP": timestamp,
            "ACCESS-NONCE": nonce,
            "ACCESS-PASSPHRASE": passphrase,
            "Content-Type": "application/json"
        }
        
        # Place order
        response = requests.post(
            "https://openapi.blofin.com/api/v1/trade/order",
            headers=headers,
            json=order_request
        )
        response.raise_for_status()
        order_response = response.json()
        
        # Verify response format and success
        if not isinstance(order_response, dict):
            raise Exception(f"Invalid order response format: {order_response}")
            
        if "code" in order_response and order_response["code"] != "0":
            raise Exception(f"Order API error: {order_response}")
            
        if "data" not in order_response:
            raise Exception(f"No data in order response: {order_response}")
            
        order_id = order_response["data"][0]["orderId"]
        print(f"Order placed: {order_id}")
        
        # 4. Wait for order confirmation
        async def listen_for_confirmation():
            while True:
                data = json.loads(await ws.recv())
                if data.get("action") == "update":
                    for order in data.get("data", []):
                        if order.get("orderId") == order_id:
                            return order
                            
        try:
            order_update = await asyncio.wait_for(
                listen_for_confirmation(),
                timeout=10
            )
            print(f"Order confirmed: {order_update}")
        except asyncio.TimeoutError:
            print("Timeout waiting for order confirmation")
            raise
        
        # 5. Cancel order
        # Generate new signature for cancel request
        timestamp = str(int(time.time() * 1000))
        nonce = timestamp
        path = "/api/v1/trade/cancel-order"
        method = "POST"
        cancel_request = {"orderId": order_id}
        msg = f"{path}{method}{timestamp}{nonce}{json.dumps(cancel_request)}"
        hex_signature = hmac.new(
            secret.encode('utf-8'),
            msg.encode('utf-8'),
            hashlib.sha256
        ).hexdigest().encode('utf-8')
        signature = base64.b64encode(hex_signature).decode()
        
        # Update headers with new signature
        headers.update({
            "ACCESS-SIGN": signature,
            "ACCESS-TIMESTAMP": timestamp,
            "ACCESS-NONCE": nonce
        })
        
        response = requests.post(
            "https://openapi.blofin.com/api/v1/trade/cancel-order",
            headers=headers,
            json=cancel_request
        )
        response.raise_for_status()
        print("Order canceled")
        
        # Clean up WebSocket connection
        await ws.close()
        
    except Exception as e:
        print(f"Error: {str(e)}")
        if isinstance(e, requests.exceptions.RequestException):
            print(f"Request error details: {e.response.text if e.response else 'No response'}")
        if 'ws' in locals():
            await ws.close()
        raise  # Re-raise the exception after cleanup

if __name__ == "__main__":
    asyncio.run(trading_example())
```

The example above demonstrates a complete trading workflow:

1. **Market Data Retrieval**
   * Fetches current order book for BTC-USDT
   * Extracts best ask price from first level
   * Calculates limit price 10% below market

2. **WebSocket Integration**
   * Establishes authenticated WebSocket connection
   * Subscribes to order updates channel
   * Handles connection cleanup properly

3. **Order Management**
   * Places limit buy order with proper parameters
   * Uses current API parameter names (marginMode, orderType, price, size)
   * Includes required broker ID in headers and request body

4. **Real-time Updates**
   * Waits for order confirmation via WebSocket
   * Implements timeout handling for confirmation
   * Processes order status updates in real-time

5. **Error Handling**
   * Validates API responses thoroughly
   * Implements proper exception handling
   * Ensures WebSocket cleanup on errors

Note: Replace the example credentials with your own API key, secret, and passphrase. The broker ID shown is specific to test credentials and may not be required for your API key.

 # Affiliate

 ## REST API

 ### GET Affiliate Info

This API is used for affiliate to get their affiliate basic info.

#### HTTP Request

`GET /api/v1/affiliate/basic`

> Request Example:
```shell
https://openapi.blofin.com/api/v1/affiliate/basic
```

> Response Example:

```json
{
    "code": 200,
    "msg": "success",
    "data": {
        "commissionRate": "0.6",
        "cashbackRate": "0.05",
        "totalCommission": "0",
        "referralCode": "blofin",
        "referralLink": "https://partner.blofin.com/d/blofin",
        "directInvitees": "0",
        "subInvitees": "0",
        "tradeInvitees": "0",
        "updateTime": "1691049629676",
        "totalTradingVolume": "0",
        "directCommission7d": "0",
        "directCommission30d": "0",
        "subCommission7d": "0",
        "subCommission30d": "0",
        "directInvitee7d": "0",
        "directInvitee30d": "0",
        "subInvitee7d": "0",
        "subInvitee30d": "0"
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
commissionRate | String | Total commission rate
cashbackRate | String | Cashback rate
totalCommission | String | Cumulative commission of all-level sub-invitees.<br>Updated every 6 hours.
referralCode | String | Default referral code
referralLink | String | Default referral link
directInvitees | String | Total invitees invited by user.
subInvitees | String | Total invitees invited by sub-affiliates.
tradeInvitees | String | Number of traded users of invitees invited both by user and sub-affiliates.
updateTime | String | Update time of data. Unix timestamp format in milliseconds, e.g. `1597026383085`
totalTradingVolume | String | Cumulative total trading volume of all-level sub-invitees and direct invitees.
directCommission7d | String | Total Commission from direct invitees in the last 7 days.
directCommission30d | String | Total Commission from direct invitees in the last 30 days.
subCommission7d | String | Total Commission from sub-invitees in the last 7 days.
subCommission30d | String | Total Commission from sub-invitees in the last 30 days.
directInvitee7d | String | Number of direct invitees in the last 7 days
directInvitee30d | String | Number of direct invitees in the last 30 days
subInvitee7d | String | Number of sub-invitees in the last 7 days
subInvitee30d | String | Number of sub-invitees in the last 30 days

### GET Referral Code 

This API is used for affiliate to get their referral code list.

#### HTTP Request

`GET /api/v1/affiliate/referral-code`

> Request Example:
```shell
GET /api/v1/affiliate/referral-code
```

> Response Example:

```json
{
    "code": 200,
    "msg": "success",
    "data": [
        {
            "referralCode": "blofin",
            "commissionRate": "0.55",
            "cashbackRate": "0.05",
            "invitees": "0",
            "remark": "",
            "isDefaultReferralCode": "true",
            "makerFeeRate": "0.0002",
            "takerFeeRate": "0.0006",
            "referralLink": "https://partner.blofin.com/d/blofin"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
referralCode | String | Referral code
commissionRate | String | Total commission rate
cashbackRate | String | Cashback rate for invitees
invitees | String | Total invitees invited with this referral code
remark | String | Remark
isDefaultReferralCode | String | Whether this referral code is the default code.<br>`true`<br>`false`
makerFeeRate | String | Futures maker fee rate for invitees
takerFeeRate | String | Futures taker fee rate for invitees
referralLink | String | Referral link

### GET Direct Invitees

Retrieve the direct invitees info of affiliates.

#### HTTP Request

`GET /api/v1/affiliate/invitees`

> Request Example:
```shell
GET /api/v1/affiliate/invitees
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
uid | String | No | Invitee's UID
needEquity | String | No | Whether to return the user's equity in the results.
after | String | No | Pagination of data to return records earlier than the requested `id`
before | String | No | Pagination of data to return records newer than the requested `id`
begin | String | No | Filter with a begin timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
end | String | No | Filter with an end timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
limit | String | No | Number of results per request. <br>When `needEquity` is `false`, the maximum limit is `200`. <br>When `needEquity` is `true`, the maximum limit is `30`. <br>The default value is `10`


> Response Example:

```json
{
    "code": 200,
    "msg": "success",
    "data": [
        {
            "id": 181,
            "uid": "30285086315",
            "registerTime": "1706861990475",
            "totalTradingVolume": "3136.78",
            "totalTradingFee": "0.4918",
            "totalCommision": "0.1475",
            "totalDeposit": "0",
            "totalWithdrawal": "100",
            "kycLevel": "0",
            "equity": "0.1",
            "totalEquity": "0.1"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
id | Long | ID
uid | String | UID of invitee
registerTime | String | Register time of invitee. Unix timestamp format in milliseconds, e.g. `1597026383085`
totalTradingVolume | String | Total futures trading amount of invitee
totalTradingFee | String | Total futures trading fee of invitee
totalCommision | String | Total commission of invitee
totalDeposit | String | The total deposited amount, expressed in USDT.<br>The conversion to USDT is based on the last spot price of the deposited currency pair at the moment the deposit is credited.
totalWithdrawal | String | Total withdrawan amount, expressed in USDT.<br>The conversion to USDT is based on the last spot price of the withdrawn currency pair at the moment the deposit is credited.
kycLevel | String | KYC level of invitee.`0` Non KYC, `1` Complete personal infomation verification, `2` Complete address proof verification
equity | String | The total equity of futures account in USDT.`0` when `needEquity` is false.
totalEquity | String | The total equity of all accounts in USDT.`0` when `needEquity` is false.




### GET Sub Invitees

Retrieve the invitees info of sub affiliates.

#### HTTP Request

`GET /api/v1/affiliate/sub-invitees`

> Request Example:
```shell
GET /api/v1/affiliate/sub-invitees
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
uid | String | No | Invitee's UID
after | String | No | Pagination of data to return records earlier than the requested `id`
before | String | No | Pagination of data to return records newer than the requested `id`
subAffiliateUid | String | No | Sub affiliate's UID
subAffiliateLevel | String | No | Sub affiliate's UID <br>`2` <br>`3` <br>`4`
begin | String | No | Filter with a begin timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
end | String | No | Filter with an end timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
limit | String | No | Number of results per request. <br>The maximum is `30`; <br>The default is `10`

> Response Example:

```json
{
    "code": 200,
    "msg": "success",
    "data": [
        {
            "id": 181,
            "uid": "30285086315",
            "subAffiliateUid": "30285102093",
            "subAffiliateLevel": "2",
            "registerTime": "1706861990475",
            "totalTradingVolume": "3136.78",
            "totalTradingFee": "0.4918",
            "totalCommision": "0.1475",
            "totalDeposit": "0",
            "totalWithdrawal": "100",
            "kycLevel": "0",
            "equity": "0.1",
            "totalEquity": "0.1"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
id | Long | ID
uid | String | UID of invitee
subAffiliateUid | String | UID of sub affiliate
subAffiliateLevel | String | Level of invitee
registerTime | String | Register time of invitee. Unix timestamp format in milliseconds, e.g. `1597026383085`
totalTradingVolume | String | Total futures trading amount of invitee
totalTradingFee | String | Total futures trading fee of invitee
totalCommision | String | Total commission of invitee
totalDeposit | String | The total deposited amount, expressed in USDT.<br>The conversion to USDT is based on the last spot price of the deposited currency pair at the moment the deposit is credited.
totalWithdrawal | String | Total withdrawan amount, expressed in USDT.<br>The conversion to USDT is based on the last spot price of the withdrawn currency pair at the moment the deposit is credited.
kycLevel | String | KYC level of invitee.`0` Non KYC, `1` Complete personal infomation verification, `2` Complete address proof verification
equity | String | The total equity of futures account in USDT
totalEquity | String | The total equity of all accounts in USDT

### GET Sub Affiliates

Retrieve the info of sub affiliates.

#### HTTP Request

`GET /api/v1/affiliate/sub-affiliates`

> Request Example:
```shell
GET /api/v1/affiliate/sub-affiliates
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
after | String | No | Pagination of data to return records earlier than the requested `id`
before | String | No | Pagination of data to return records newer than the requested `id`
subAffiliateUid | String | No | Sub affiliate's UID
subAffiliateLevel | String | No | Sub affiliate's UID <br>`2` <br>`3` <br>`4`
begin | String | No | Filter with a begin timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
end | String | No | Filter with an end timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
limit | String | No | Number of results per request. <br>The maximum is `100`; <br>The default is `10`

> Response Example:

```json
{
    "code": 200,
    "msg": "success",
    "data": [
        {
            "id": 123,
            "uid": "30285143170",
            "commissionRate": "0.1",
            "createTime": "1707018797957",
            "upperAffiliate": "30285102093",
            "invitees": "1",
            "totalTradedUsers": "1",
            "totalTradingVolume": "3120",
            "totalTradingFee": "0.624",
            "totalCommision": "0.0624",
            "myCommision": "0.0104",
            "tag": "",
            "kycLevel": "0"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
id | Long | ID
uid | String | UID of sub affiliate
commissionRate | String | Commission rate of sub affiliate
createTime | String | Create time of sub affiliate. Unix timestamp format in milliseconds, e.g. `1597026383085`
upperAffiliate | String | Upper affiliate of sub affiliate
invitees | String | Total invitees of sub affiliate
totalTradedUsers | String | Total traded invitees of sub affiliate
totalTradingVolume | String | Total futures trading volume of sub affiliate's invitees
totalTradingFee | String | Total fututres trading fee of sub affiliate's invitees
totalCommision | String | Total commission of sub affiliate
myCommision | String | My commission got from sub affiliate
tag | String | Tag
kycLevel | String | KYC level of invitee.`0` Non KYC, `1` Complete personal infomation verification, `2` Complete address proof verification

### GET Daily Commission of Direct Invitees


Retrieve the daily commission data of direct invitees.


#### HTTP Request


`GET /api/v1/affiliate/invitees/daily/info`


> Request Example:
```shell
GET /api/v1/affiliate/invitees/daily/info
```


#### Request Parameters


Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
uid | String | Yes | Invitee’s UID，<br>Required if only `begin`/`end` paging is used, otherwise the data will be inaccurate if only `begin`/`end` is used.
begin | String | No | Filter with a begin timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
end | String | No | Filter with an end timestamp. Unix timestamp format in milliseconds, e.g. `1597026383085`
limit | String | No | Number of results per request. <br>The maximum is `100`; <br>The default is `10`


> Response Example:


```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "uid": "30292758476",
            "commission": "0.032035434",
            "commissionTime": "1716912000000",
            "cashback": "0.288318906",
            "fee": "3.2035434",
            "kycLevel": "0",
            "tradingVolume": "200"
        }
    ]
}
```


#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
uid | String | Invitee’s UID
commission | String | Daily Commission of invitee
commissionTime | String | Commission time. Unix timestamp format in milliseconds, e.g. `1597026383085`
cashback | String | Cashback of invitee
fee | String | Daily trading fee of invitee
kycLevel | String | KYC level of invitee.`0` Non KYC, `1` Complete personal infomation verification, `2` Complete address proof verification
tradingVolume | String | Daily trading amount of invitee

# Copy Trading
## REST
### GET Instruments
Retrieve a list of available instruments for copy trading.

#### HTTP Request
`GET /api/v1/copytrading/instruments`


> Request Example:
```shell
GET /api/v1/copytrading/instruments
```



> Response Example:


```json
{
    "code": 0,
    "msg": "success",
    "data": {
       instIdList:["BTC-USDT","ETH-USDT"]
    }
}
```


#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
instIdList | ARRAY | List of Instruments, e.g. `BTC-USDT`

### GET Account Configuration

#### HTTP Request
`GET /api/v1/copytrading/config`


> Request Example:
```shell
GET /api/v1/copytrading/config
```



> Response Example:


```json
{
"code": "0",
"msg": "success",
"data": {
        "nickName": "BloFin_e2dd2d32f",
        "roleType": "1"
        }
}
```


#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
nickName | String | Nickname
roleType | String | Role type.<br>`0`: General user<br>`1`: Trader


### GET Copy Trading Account Balance
Retrieve a list of assets (with non-zero balance), remaining balance, and available amount in the Copy Trading Account.
#### HTTP Request
`GET /api/v1/copytrading/account/balance`
> Request Example:

```shell
GET /api/v1/copytrading/account/balance
```

> Response Example:


```json
{
"code": "0",
"msg": "success",
"data": {
        "ts": "1697021343571",
        "totalEquity": "10011254.077985990315787910",
        "isolatedEquity": "861.763132108800000000",
        "details": [{
                    "currency": "USDT",
                    "equity": "10014042.988958415234430699548",
                    "balance": "10013119.885958415234430699",
                    "ts": "1697021343571",
                    "isolatedEquity": "862.003200000000000000048",
                    "available": "9996399.4708691159703362725",
                    "availableEquity": "9996399.4708691159703362725",
                    "frozen": "15805.149672632597427761",
                    "orderFrozen": "14920.994472632597427761",
                    "equityUsd": "10011254.077985990315787910",
                    "isolatedUnrealizedPnl": "-22.151999999999999999952",
                    "bonus": "0"
                }]
        }
}
```

#### Response Paremeters
Parameter | Type | Description
----------------- | ----- | -----------
ts | String | Update time. Unix timestamp format in milliseconds, e.g. `1597026383085`
totalEquity | String | The total amount of equity in USD
isolatedEquity | String | Daily Isolated margin equity in USD
details | Array | Detailed asset information in all currencies
`>currency` | String | Currency
`>equity` | String | Equity of currency
`>balance` | String | Cash balance
`>ts` | String | Update time. Unix timestamp format in milliseconds, e.g. `1597026383085`
`>isolatedEquity` | String | Isolated margin equity of the currency
`>available` | String | Available balance of currency
`>availableEquity` | String | Available equity of currency
`>frozen` | String | Frozen balance of currency
`>orderFrozen` | String | Margin frozen for open orders
`>equityUsd` | String | Equity in USD of currency
`>isolatedUnrealizedPnl` | String | Isolated unrealized profit and loss of currency
`>bonus` | String | Bonus balance


### GET Positions (By Order)
Retrieve information on your positions in by order mode.
#### HTTP Request
`GET /api/v1/copytrading/account/positions-by-order`

> Request Example:

```shell
GET /api/v1/copytrading/account/positions-by-order
```

#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
orderId | String | No | Order ID
limit | String | No | Number of results per request. The maximum is `20`; The default is `20`
after | String | No | Pagination of data to return records earlier than the requested `orderId`
before | String | No | Pagination of data to return records newer than the requested `orderId`

> Response Example
```json
{
    "code": "0",
    "msg": "succeed",
    "data": [
        {
            "orderId": "254098",
            "instId": "GMT-USDT",
            "marginMode": "cross",
            "positionSide": "net",
            "leverage": "3",
            "positions": "825",
            "availablePositions": "825",
            "averagePrice": "1.212",
            "markPrice": "1.21",
            "realizedPnl": "0",
            "unrealizedPnl": "-1.65",
            "unrealizedPnlRatio": "-0.004868571595271319",
            "createTime": "1733472937600",
            "updateTime": "1733472937712"
        }
    ]
}
```

#### Response Paremeters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
instId | String | Instrument ID, e.g. `BTC-USDT`
instType | String | Instrument type
marginMode | String | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Position side.<br>`long`: positions are positive<br>`short`: positions are positive<br>`net` (Positive `positions` means long position and negative `positions` means short position.)
leverage | String | Leverage
positions | String | Quantity of positions. The initial opening position remains unchanged by subsequent closing trades.
availablePositions |String | Position that can be closed. Equals the `positions` less the cumulative closed position.
averagePrice | String | Average open price
markPrice | String | Latest Mark price
unrealizedPnl | String | Unrealized profit and loss calculated by mark price
unrealizedPnlRatio | String | Unrealized profit and loss ratio calculated by mark price
realizedPnl | String | Realized profit and loss
createTime | String | Order create time. Unix timestamp format in milliseconds, e.g. `1597026383085`
updateTime | String | Update time. Unix timestamp format in milliseconds, e.g. `1597026383085`

### GET Position Close Details (By Order)
Retrieve the close History of the position(By Order)

#### HTTP Request
`GET /api/v1/copytrading/account/positions-details-by-order`

> Request Example:

```shell
GET /api/v1/copytrading/account/positions-details-by-order
```
#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
orderId | String | Yes | Order ID

> Response Example
```json
{
    "code": "0",
    "msg": "succeed",
    "data": {
        "orderList": [
            {
                "closeOrderId": "1216365",
                "instId": "BNB-USDT",
                "positionSide": "net",
                "closeType": "close",
                "side": "sell",
                "orderTime": "1733495157425",
                "size": "8.82",
                "price": "market",
                "filledAmount": "0.0882",
                "averagePrice": "999.97",
                "fee": "0.0529184124",
                "realizedPnl": "0",
                "realizedPnlRatio": "0"
            },
            {
                "closeOrderId": "1216366",
                "instId": "BNB-USDT",
                "positionSide": "net",
                "closeType": "close",
                "side": "sell",
                "orderTime": "1733495157959",
                "size": "7.94",
                "price": "market",
                "filledAmount": "0.0794",
                "averagePrice": "999.97",
                "fee": "0.0476385708",
                "realizedPnl": "0",
                "realizedPnlRatio": "0"
            }
        ]
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
closeOrderId | String | Close order ID
instId | String | Instrument ID, e.g. `BTC-USDT`
positionSide | String | Position side.<br>`long`: positions are positive<br>`short`: positions are positive<br>`net` (Positive `positions` means long position and negative `positions` means short position.)
closeType | String | Close type<br>`close`<br>`liquidation`<br>`adl`<br>`tp`<br>`sl`
side | String | Order side<br>`buy`<br>`sell`
orderTime | String | Order create time. Unix timestamp format in milliseconds, e.g. `1597026383085`
size | String | Order amount
filledAmount | String | Filled amount
averagePrice | String | Average open price
fee | String | Fee
realizedPnl | String | Realized PnL of this order
realizedPnlRatio | String | Realized PnL ratio of this order
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.



### GET Positions (By Contract)
Retrieve information on your positions in "By Contract" mode.

#### HTTP Request
`GET /api/v1/copytrading/account/positions-by-contract`

> Request Example:

```shell
GET /api/v1/copytrading/account/positions-details-by-order
```

#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`

> Response Example
```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "positionId": "68190",
            "instId": "GMT-USDT",
            "instType": "SWAP",
            "marginMode": "cross",
            "positionSide": "net",
            "adl": "1",
            "positions": "2935.2",
            "availablePositions": "2935.2",
            "averagePrice": "1.211999326885720075",
            "markPrice": "1.21",
            "marginRatio": "288116678144.563637857397712521",
            "liquidationPrice": "",
            "unrealizedPnl": "-5.86842427496556414",
            "unrealizedPnlRatio": "-0.004948831673506182",
            "initialMargin": "1183.864",
            "maintenanceMargin": "23.085348",
            "createTime": "1733467457267",
            "updateTime": "1733473143056",
            "leverage": "3"
        }
    ]
}
```
#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
positionId | String | Position ID
instId | String | Instrument ID, e.g. `BTC-USDT`
instType | String | Instrument type
marginMode | String | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Position side.<br>`long`: positions are positive<br>`short`: positions are positive<br>`net` (Positive `positions` means long position and negative `positions` means short position.)
adl | String | ADL lever
leverage | String | Leverage
positions | String | Quantity of positions
availablePositions | String | Position that can be closed
averagePrice | String | Average open price
markPrice | String | Mark Price
marginRatio | String | Margin Ratio
liquidationPrice | String | Estimated liquidation price.
unrealizedPnl | String | Unrealized profit and loss calculated by mark price
unrealizedPnlRatio | String | Unrealized profit and loss ratio calculated by mark price
initialMargin | String | Initial margin requirement, only applicable to `cross`
maintenanceMargin | String | Maintenance margin requirement
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
updateTime | String | The latest time position was adjusted, Unix timestamp format in milliseconds, e.g. `1597026383085`

### GET Position Mode
Get user's position mode (Hedge Mode or One-way Mode) on every symbol

> Request Example:
```shell
GET /api/v1/copytrading/account/position-mode
```

#### HTTP Request

`GET /api/v1/copytrading/account/position-mode`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "positionMode": "net_mode"
    }
}
```
#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
positionMode | String | Position mode <br> `net_mode`:   net<br> `long_short_mode`: long/short


### Set Position Mode
Change user's position mode (Hedge Mode or One-way Mode) on every symbol

#### HTTP Request

`POST /api/v1/copytrading/account/set-position-mode`

> Request Example:
```shell
POST /api/v1/copytrading/account/set-position-mode
body
{
    "positionMode": "net_mode"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
positionMode | String | Yes | Position mode <br> `net_mode`: net<br> `long_short_mode`: long/short

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "positionMode": "net_mode"
    }
}
```
#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
positionMode | String | Position mode <br> `net_mode`:   net<br> `long_short_mode`: long/short

### GET Leverage

#### HTTP Request
`GET /api/v1/copytrading/account/leverage-info`

> Request Example:
```shell
GET /api/v1/copytrading/account/leverage-info?instId=BTC-USDT,ETH-USDT&marginMode=cross
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID<br>Single instrument ID or multiple instrument IDs (no more than 20) separated with comma
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "leverage": "50",
            "marginMode": "cross",
            "instId": "BTC-USDT",
            "positionSide":"net"
        },
        {
            "leverage": "3",
            "marginMode": "cross",
            "instId": "ETH-USDT",
            "positionSide":"net"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
instId | String | Instrument ID
leverage | String | Leverage
marginMode | String | Margin mode
positionSide | String | Position side<br>`long`<br>`short`<br>`net`

### Set Leverage

#### HTTP Request

`POST /api/v1/copytrading/account/set-leverage`

> Request Example:
```shell
POST /api/v1/copytrading/account/set-leverage
body
{
    "instId":"BTC-USDT",
    "leverage":"100",
    "marginmode":"cross",
    "positionSide":"long"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
leverage | String | Yes | Leverage
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`
positionSide | String | No | Position side <br>`long` `short`<br>Only required when margin mode is `isolated` in `long/short` mode 

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "leverage": "100",
        "marginMode": "cross",
        "instId": "BTC-USDT",
        "positionSide":"long"
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
instId | String | Instrument ID
leverage | String | Leverage
marginMode | String | Margin mode
positionSide | String | Position side<br>`long`<br>`short`<br>`net`

### GET Active orders
Retrieve all incomplete orders under the current account.

#### HTTP Request
`GET /api/v1/copytrading/trade/orders-pending`

> Request Example:
```shell
GET /api/v1/copytrading/trade/orders-pending
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
orderType | String | No | Order type<br>`market`: market order<br>`limit`: limit order<br>`post_only`: Post-only order<br>`fok`: Fill-or-kill order<br>`ioc`: Immediate-or-cancel order
state | String | No | State<br>`live`<br>`partially_filled`
after | String | No | Pagination of data to return records earlier than the requested `orderId`
before | String | No | Pagination of data to return records newer than the requested `orderId`
limit | String | No | Number of results per request. The maximum is `100`; The default is `20`

The `before` and `after` parameters cannot be used simultaneously.

> Response Example:

```json
{
    "code": "0",
    "msg": "succeed",
    "data": [
        {
            "orderId": "254531",
            "symbol": "BNB-USDT",
            "marginMode": "cross",
            "positionSide": "net",
            "side": "buy",
            "orderType": "limit",
            "price": "900",
            "size": "2.22",
            "leverage": "3",
            "state": "effective",
            "filledSize": "0",
            "averagePrice": "0",
            "pnl": "0",
            "createTime": "1733490858770",
            "updateTime": "1733490888650",
            "tpTriggerPrice": "1200",
            "tpOrderPrice": "-1",
            "slTriggerPrice": "800",
            "slOrderPrice": "-1"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
instId | String | Instrument ID
marginMode | String | Margin mode
positionSide | String | Position side
side | String | Order side
orderType | String | Order type
price | String | Price
size | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
reduceOnly | String | Whether orders can only reduce in position size.
leverage | String | Leverage
state | String | State
filledSize | String | Accumulated fill quantity.
averagePrice | String | Average filled price. If none is filled, it will return "".
pnl | String | Profit and loss, Applicable to orders which have a trade and aim to close position.
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
updateTime | String | Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
tpTriggerPrice | String | Take-profit trigger price
tpOrderPrice | String | Take-profit order price. <br>If the price is `-1`, take-profit will be executed at the market price.
slTriggerPrice | String | Stop-loss trigger price
slOrderPrice | String | Stop-loss order price. <br>If the price is `-1`, stop-loss will be executed at the market price.
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


### Place Order

#### HTTP Request

`POST /api/v1/copytrading/trade/place-order`

> Request Example:
```shell
POST /api/v1/copytrading/trade/place-order
body
{
    "instId":"BTC-USDT",
    "marginMode":"cross",
    "positionSide":"long",
    "side":"sell",
    "price":"23212.2",
    "size":"2"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Yes | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
side | String | Yes | Order side, `buy` `sell`
orderType | String | Yes | Order type<br>`market`: market order<br>`limit`: limit order<br>`fok`: Fill-or-kill order<br>`ioc`: Immediate-or-cancel order
price | String | Yes | Order price. Not applicable to `market`
size | String | Yes | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


> Response Example:

```json
{
    "code": "0",
    "msg": "",
    "data": [
        {
            "orderId": "28150801",
            "clientOrderId": "test1597321",
            "msg": "",
            "code": "0"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.

### Cancel Order

#### HTTP Request

`POST /api/v1/copytrading/trade/cancel-order`

> Request Example:
```shell
POST /api/v1/copytrading/trade/cancel-order
body
{
  "orderId": "23209016"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
orderId | String | Yes | Order ID

> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "code": "0",
        "msg": null
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.

### Place TPSL (By Contract)

#### HTTP Request

`POST /api/v1/copytrading/trade/place-tpsl-by-contract`

> Request Example:
```shell
POST /api/v1/copytrading/trade/place-tpsl-by-contract
body
{
  "instId": "BTC-USDT",
  "marginMode": "cross",
  "positionSide": "short",
  "tpTriggerPrice": "80000",
  "slTriggerPrice": "101000",
  "size": "-1"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Yes | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
tpTriggerPrice | String | Yes | Take-profit trigger price
slTriggerPrice | String | Yes | Stop-loss trigger price
size | String | Yes | Quantity<br>If the quantity is `-1`, it means entire positions
type | String | No | TP/SL Type<br>`pnl`:close by the order of pnl volume<br>`fixedRatio`:close all orders with same ratio, `0.1` represents 10% of total position.<br>The default value is `pnl`
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": {
        "algoId": "1234543265637"
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
algoId | String | TP/SL order ID
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.


### GET Active TPSL (By Contract)

#### HTTP Request
`GET /api/v1/copytrading/trade/pending-tpsl-by-contract`

> Request Example:
```shell
GET /api/v1/copytrading/trade/pending-tpsl-by-contract?instId=BTC-USDT
```
#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- |----------| -----------
instId | String | No       | Instrument ID, e.g. `BTC-USDT`
algoId | String | No       | Algo order ID

> Response Example:

```json
{
    "code": "0",
    "msg": "succeed",
    "data": [
        {
            "algoId": "12101",
            "instId": "BTC-USDT",
            "marginMode": "cross",
            "positionSide": "NET",
            "tpTriggerPrice": "110000",
            "tpOrderPrice": "-1",
            "slTriggerPrice": "90000",
            "slOrderPrice": "-1",
            "size": "10",
            "state": "effective",
            "leverage": "1",
            "actualSize": "0.0977",
            "createTime": "1733493956808"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
algoId | String | TP/SL order ID
instId | String | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
tpTriggerPrice | String | Take-profit trigger price
tpOrderPrice | String | Take-profit order price. <br>If the price is `-1`, take-profit will be executed at the market price.
slTriggerPrice | String | Stop-loss trigger price
slOrderPrice | String | Stop-loss order price. <br>If the price is `-1`, stop-loss will be executed at the market price.
size | String | Quantity<br>If the quantity is `-1`, it means entire positions
state | String | State<br>`live`, `effective`, `canceled`, `order_failed`
leverage | String | Leverage
actualSize | String | Actual order quantity
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


### Cancel TPSL (By Contract)

#### HTTP Request
`POST /api/v1/copytrading/trade/cancel-tpsl-by-contract`

> Request Example:
```shell
POST /api/v1/copytrading/trade/cancel-tpsl-by-contract
body
{
  "algoId": "23209016"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
algoId | String | Yes | TP/SL order ID

> Response Example:

```json
{
    "code": "0",
    "msg": "success"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.

### GET Position History (By order)

#### HTTP Request
`GET /api/v1/copytrading/trade/position-history-by-order`

> Request Example:
```shell
GET /api/v1/copytrading/trade/position-history-by-order?instId=BTC-USDT&limit=10
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
before | String | No | Pagination of data to return records earlier than the requested `orderId`
after | String | No | Pagination of data to return records newer than the requested `orderId`
limit | String | No | Number of results per request. The maximum is `20`; The default is `20`


> Response Example:

```json
{
    "code": "0",
    "msg": "success",
    "data": [
        {
            "orderId": "2411",
            "instId": "ETH-USDT",
            "leverage": "cross",
            "positionSide": "net",
            "orderSide": "buy",
            "positions": "123",
            "createTime": "1697016700775",
            "openAveragePrice": "1666.000000000000000000",
            "closeTime": "1697016700775",
            "closeAveragePrice": "1666.000000000000000000",
            "pnl": "2411.12",
            "pnlRatio": "0.001587301587301587",
            "copiers": "123",
            "closeType": "tp",
            "preSharing": "4816.12",
            "size": "1"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
instId | String | Instrument ID, e.g. `BTC-USDT`
leverage | String | Leverage
positionSide | String | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
side | String | Order side, `buy` `sell`
positions | String | Positions amount
createTime | String | Order create time. Unix timestamp format in milliseconds, e.g. `1597026383085`
openAveragePrice | String | Average open price
closeTime | String | Closing time. Unix timestamp format in milliseconds, e.g. `1597026383085`
closeAveragePrice | String | Average closing price
pnl | String | PnL
pnlRatio | String | PnL ratio
copiers | String | Number of copiers who have successfully copied this position
closeType | String | Close type<br>`mannual`<br>`liquidation`<br>`adl`<br>`tp`<br>`sl`<br>`multiple`
preSharing | String | Pre-sharing Amount

### GET Order History

#### HTTP Request
`GET /api/v1/copytrading/trade/orders-history`

> Request Example:
```shell
GET /api/v1/copytrading/trade/orders-history?instId=BTC-USDT&limit=10
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | No | Instrument ID, e.g. `BTC-USDT`
before | String | No | Pagination of data to return records earlier than the requested `orderId`
after | String | No | Pagination of data to return records newer than the requested `orderId`
limit | String | No | Number of results per request. The maximum is `20`; The default is `20`


> Response Example:

```json
{
    "code": "0",
    "msg": "succeed",
    "data": [
        {
            "orderId": "254107",
            "instId": "GMT-USDT",
            "leverage": "3",
            "marginMode": "cross",
            "positionSide": "net",
            "orderType": "market",
            "price": "1.212",
            "side": "sell",
            "size": "825",
            "createTime": "1733473143212",
            "updateTime": "1733473143212",
            "averagePrice": "1.21",
            "fee": "0.2648448",
            "pnl": "-0.7296",
            "orderCategory": "normal",
            "state": "partially_canceled",
            "filledSize": "364.8"
        },
        {
            "orderId": "254106",
            "instId": "GMT-USDT",
            "leverage": "3",
            "marginMode": "cross",
            "positionSide": "net",
            "orderType": "market",
            "price": "1.212",
            "side": "sell",
            "size": "825",
            "createTime": "1733473143001",
            "updateTime": "1733473143001",
            "averagePrice": "1.210023006060606061",
            "fee": "0.598961388",
            "pnl": "-1.631019999999999675",
            "orderCategory": "normal",
            "state": "filled",
            "filledSize": "825"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
instId | String | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
side | String | Order side, `buy` `sell`
orderType | String | Order type
price | String | Order price
size | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
leverage | String | Leverage
state | String | State
filledSize | String | Accumulated fill quantity.
pnl | String | PnL
averagePrice | String | Average filled price. If none is filled, it will return “”.
fee | String | Fee and rebate
createTime | String | Order create time. Unix timestamp format in milliseconds, e.g. `1597026383085`
updateTime | String | Update time. Unix timestamp format in milliseconds, e.g. `1597026383085`
orderCategory | String | Order category.<br>`normal`<br>`liquidation`<br>`adl`<br>`tp`<br>`sl`
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


### GET Active TPSL (By Order)

#### HTTP Request
`GET /api/v1/copytrading/trade/pending-tpsl-by-order`

> Request Example:
```shell
GET /api/v1/copytrading/trade/pending-tpsl-by-order?orderId=144265765
```
#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
orderId | String | Yes | Order ID

> Response Example:

```json
{
    "code": "0",
    "msg": "succeed",
    "data": [
        {
            "orderId": "253085",
            "instId": "BTC-USDT",
            "marginMode": "cross",
            "positionSide": "NET",
            "tpTriggerPrice": "102761.4",
            "tpOrderPrice": "-1",
            "slTriggerPrice": "75281.40000000001",
            "slOrderPrice": "-1",
            "size": "0.0977",
            "state": "effective",
            "leverage": "1",
            "createTime": "1733467498988"
        }
    ]
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
orderId | String | Order ID
instId | String | Instrument ID, e.g. `BTC-USDT`
marginMode | String | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
tpTriggerPrice | String | Take-profit trigger price
tpOrderPrice | String | Take-profit order price. <br>If the price is `-1`, take-profit will be executed at the market price.
slTriggerPrice | String | Stop-loss trigger price
slOrderPrice | String | Stop-loss order price. <br>If the price is `-1`, stop-loss will be executed at the market price.
size | String | Quantity<br>If the quantity is `-1`, it means entire positions
state | String | State<br>`live`, `effective`, `canceled`, `order_failed`
leverage | String | Leverage
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
brokerId | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


### Place TPSL (By Order)

#### HTTP Request
`POST /api/v1/copytrading/trade/place-tpsl-by-order`

> Request Example:
```shell
POST /api/v1/copytrading/trade/place-tpsl-by-order
body
{
  "orderId": "23209016"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
orderId | String | Yes | Order ID
tpTriggerPrice | String | Yes | Take-profit trigger price
slTriggerPrice | String | Yes | Stop-loss trigger price
size | String | Yes | Quantity<br>If the quantity is `-1`, it means entire positions
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


> Response Example:

```json
{
    "code": "0",
    "msg": "success"
    }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.


### Cancel TPSL (By Order)

#### HTTP Request
`POST /api/v1/copytrading/trade/cancel-tpsl-by-order`

> Request Example:
```shell
POST /api/v1/copytrading/trade/cancel-tpsl-by-order
body
{
  "orderId": "23209016"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
orderId | String | Yes | Order ID

> Response Example:

```json
{
    "code": "0",
    "msg": "success"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
code | String | The code of the event execution result, `0` means success.
msg | String | Rejection or success message of event execution.


### Close Position (By Order)

#### HTTP Request
`POST /api/v1/copytrading/trade/close-position-by-order`

> Request Example:
```shell
POST /api/v1/copytrading/trade/close-position-by-order
body
{
  "orderId": "23209016",
  "size": "1214"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
orderId | String | Yes | Order ID
size | String | Yes | Close amount
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


> Response Example:

```json
{
    "code": "0",
    "msg": "success"
}
```


### Close Position (By Contract)

#### HTTP Request
`POST /api/v1/copytrading/trade/close-position-by-contract`

> Request Example:
```shell
POST /api/v1/copytrading/trade/close-position-by-contract
body
{
    "instId":"BTC-USDT",
    "marginMode":"cross",
    "positionSide":"long",
    "closeType":"pnl",
    "size":"1234"
}
```

#### Request Parameters

Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
instId | String | Yes | Instrument ID
marginMode | String | Yes | Margin mode<br>`cross`<br>`isolated`
positionSide | String | Yes | Position side<br>Default `net` for One-way Mode <br>`long` or `short` for Hedge Mode. It must be sent in Hedge Mode.
closeType | String | Yes | Close type.<br>`pnl`: Close by PnL order<br>`fixedRatio`: All copy trading positions will close the same ratio
size | String | Yes | Contracts when you choose to close by `pnl`.<br>Close ratio when you choose to close by `fixedRatio`, `0.1` represents 10% of total position.
brokerId | String | No | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


> Response Example:

```json
{
    "code": "0",
    "msg": "success"
}
```







## WEBSOCKET
### WS Positions(By Contract) Channel

This channel uses private WebSocket and authentication is required.

Retrieve position information. Initial snapshot will be pushed according to subscription granularity. Data will be pushed when triggered by events such as placing/canceling order, and will also be pushed in regular interval according to subscription granularity.

> Request Example:
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"copytrading-positions"
        }
    ]
}
```


#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `copytrading-positions`



> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "copytrading-positions"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"copytrading-positions\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | String | Event, `subscribe` `unsubscribe` `error`
arg | Object | Subscribed channel
`>channel` | String | Channel name
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg":{
        "channel":"copytrading-positions"
    },
    "data":[
        {
            "instType":"SWAP",
            "instId":"BNB-USDT",
            "marginMode":"cross",
            "positionId":"8138",
            "positionSide":"net",
            "positions":"-100",
            "availablePositions":"-100",
            "averagePrice":"130.06",
            "unrealizedPnl":"-77.1",
            "unrealizedPnlRatio":"-1.778409964631708442",
            "leverage":"3",
            "liquidationPrice":"107929.699398660166170462",
            "markPrice":"207.16",
            "initialMargin":"69.053333333333333333",
            "margin":"",
            "marginRatio":"131.337873621866389829",
            "maintenanceMargin":"1.0358",
            "adl":"3",
            "createTime":"1695795726481",
            "updateTime":"1695795726484"
        }
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | Object | Successfully subscribed channel
`>channel` | String | Channel name
data | Array | Subscribed data
`>instId` | String | Instrument ID, e.g. `BTC-USDT`
`>instType` | String | Instrument type
`>marginMode` | String | Margin mode<br>`cross`<br>`isolated`
`>positionId` | String | Position ID
`>positionSide` | String | Position side<br>`long`<br>`short`<br>`net` (Positive `position` means long position and negative `position` means short position.)
`>positions` | String | Quantity of positions
`>availablePositions` | String | Position that can be closed
`>averagePrice` | String | Average open price
`>unrealizedPnl` | String | Unrealized profit and loss calculated by mark price.
`>unrealizedPnlRatio` | String | Unrealized profit and loss ratio calculated by mark price.
`>leverage` | String | Leverage
`>liquidationPrice` | String | Estimated liquidation price
`>markPrice` | String | Latest Mark price
`>initialMargin` | String | Initial margin requirement, only applicable to `cross`.
`>margin` | String | Margin, can be added or reduced.
`>marginRatio` | String | Margin ratio
`>maintenanceMargin` | String | Maintenance margin requirement
`>adl` | String | Auto decrease line, signal area<br>Divided into 5 levels, from 1 to 5, the smaller the number, the weaker the adl intensity.
`>createTime` | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>updateTime` | String | Latest time position was adjusted, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>attachTpsls` | String | Attached TP/SL order
`>> tpTriggerPrice` | String | Take-profit trigger price
`>> tpTriggerPriceType` | String | Take-profit trigger price type `last`
`>> tpOrderPrice` | String | Take-profit order price. <br>If the price is `-1`, take-profit will be executed at the market price.
`>> slTriggerPrice` | String | Stop-loss trigger price
`>> slTriggerPriceType` | String | Stop-loss trigger price type `last`
`>> slOrderPrice` | String | Stop-loss order price. <br>If the price is `-1`, stop-loss will be executed at the market price.
`>> size` | String | Quantity<br>If the quantity is `-1`, it means entire positions




### WS Positions(By Order) Channel

This channel uses private WebSocket and authentication is required.

Retrieve position information. Initial snapshot will be pushed according to subscription granularity. Data will be pushed when triggered by events such as placing/canceling order, and will also be pushed in regular interval according to subscription granularity.

> Request Example:
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"copytrading-sub-positions"
        }
    ]
}
```


#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `copytrading-sub-positions`



> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "copytrading-sub-positions"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"copytrading-sub-positions\", \"instType\" : \"SWAP\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | String | Event, `subscribe` `unsubscribe` `error`
arg | Object | Subscribed channel
`>channel` | String | Channel name
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg":{
        "channel":"copytrading-sub-positions"
    },
    "data":[
        {
            "instType":"SWAP",
            "instId":"BNB-USDT",
            "marginMode":"cross",
            "positionId":"8138",
            "positionSide":"net",
            "positions":"-100",
            "availablePositions":"-100",
            "averagePrice":"130.06",
            "unrealizedPnl":"-77.1",
            "unrealizedPnlRatio":"-1.778409964631708442",
            "leverage":"3",
            "liquidationPrice":"107929.699398660166170462",
            "markPrice":"207.16",
            "initialMargin":"69.053333333333333333",
            "margin":"",
            "marginRatio":"131.337873621866389829",
            "maintenanceMargin":"1.0358",
            "adl":"3",
            "createTime":"1695795726481",
            "updateTime":"1695795726484"
        }
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | Object | Successfully subscribed channel
`>channel` | String | Channel name
data | Array | Subscribed data
`>instId` | String | Instrument ID, e.g. `BTC-USDT`
`>instType` | String | Instrument type
`>marginMode` | String | Margin mode<br>`cross`<br>`isolated`
`>positionId` | String | Position ID
`>positionSide` | String | Position side<br>`long`<br>`short`<br>`net` (Positive `position` means long position and negative `position` means short position.)
`>positions` | String | Quantity of positions
`>availablePositions` | String | Position that can be closed
`>averagePrice` | String | Average open price
`>unrealizedPnl` | String | Unrealized profit and loss calculated by mark price.
`>unrealizedPnlRatio` | String | Unrealized profit and loss ratio calculated by mark price.
`>leverage` | String | Leverage
`>liquidationPrice` | String | Estimated liquidation price
`>markPrice` | String | Latest Mark price
`>initialMargin` | String | Initial margin requirement, only applicable to `cross`.
`>margin` | String | Margin, can be added or reduced.
`>marginRatio` | String | Margin ratio
`>maintenanceMargin` | String | Maintenance margin requirement
`>adl` | String | Auto decrease line, signal area<br>Divided into 5 levels, from 1 to 5, the smaller the number, the weaker the adl intensity.
`>createTime` | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>updateTime` | String | Latest time position was adjusted, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>attachTpsls` | String | Attached TP/SL order
`>> tpTriggerPrice` | String | Take-profit trigger price
`>> tpTriggerPriceType` | String | Take-profit trigger price type `last`
`>> tpOrderPrice` | String | Take-profit order price. <br>If the price is `-1`, take-profit will be executed at the market price.
`>> slTriggerPrice` | String | Stop-loss trigger price
`>> slTriggerPriceType` | String | Stop-loss trigger price type `last`
`>> slOrderPrice` | String | Stop-loss order price. <br>If the price is `-1`, stop-loss will be executed at the market price.
`>> size` | String | Quantity<br>If the quantity is `-1`, it means entire positions

### WS Order Channel

This channel uses private WebSocket and authentication is required.

Retrieve order information. Data will not be pushed when first subscribed. Data will only be pushed when there are order updates.


> Request Example: 
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"copytrading-orders"
        }
    ]
}
```

#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `copytrading-orders`


> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "copytrading-orders"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"copytrading-orders\", \"instType\" : \"SWAP\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | String | Event, `subscribe` `unsubscribe` `error`
args | Object | Subscribed channel
`>channel` | String | Channel name
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
    "arg":{
        "channel":"copytrading-orders"
    },
    "data":[
        {
            "instType":"SWAP",
            "instId":"BTC-USDT",
            "orderId":"28334314",
            "price":"28000.000000000000000000",
            "size":"10",
            "orderType":"limit",
            "side":"sell",
            "positionSide":"net",
            "marginMode":"cross",
            "filledSize":"0",
            "filledAmount":"0.000000000000000000",
            "averagePrice":"0.000000000000000000",
            "state":"live",
            "leverage":"2",
            "tpTriggerPrice":"27000.000000000000000000",
            "tpOrderPrice":"-1",
            "slTriggerPrice":null,
            "slOrderPrice":null,
            "fee":"0.000000000000000000",
            "pnl":"0.000000000000000000",
            "cancelSource":"",
            "orderCategory":"pre_tp_sl",
            "createTime":"1696760245931",
            "updateTime":"1696760245973"
        }
    ]
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
action | String | Push data action, incremental data or full snapshot.<br>`snapshot`: full<br>`update`: incremental
arg | Object | Successfully subscribed channel
`>channel` | String | Channel name
data | Array | Subscribed data
`>instId` | String | Instrument ID, e.g. `BTC-USDT`
`>instType` | String | Instrument type
`>orderId` | String | Order ID
`>price` | String | Price
`>size` | String | Number of contracts to buy or sell. For contract size details, refer to the /api/v1/market/instruments endpoint
`>orderType` | String | Order type
`>side` | String | Order side
`>positionSide` | String | Position side
`>marginMode` | String | Margin mode
`>filledSize` | String | Accumulated fill quantity
`>filledAmount` | String | 
`>averagePrice` | String | Average filled price. If none is filled, it will return "".
`>state` | String | State
`>leverage` | String | Leverage
`>tpTriggerPrice` | String | Take-profit trigger price
`>tpOrderPrice` | String | Take-profit order price. If the price is `-1`, take-profit will be executed at the market price.
`>slTriggerPrice` | String | Stop-loss trigger price
`>slOrderPrice` | String | Stop-loss order price. If the price is `-1`, stop-loss will be executed at the market price.
`>fee` | String | Fee and rebate
`>pnl` | String | Profit and loss, Applicable to orders which have a trade and aim to close position.
`>cancelSource` | String | 
`>orderCategory` | String | Order category<br>`normal`<br>`full_liquidation`<br>`partial_liquidation`<br>`adl`<br>`tp`<br>`sl`
`>createTime` | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>updateTime` | String | Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>brokerId` | String | Broker ID provided by BloFin.<br>A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters.


### WS Account Channel

This channel uses private WebSocket and authentication is required.

Retrieve account information. Data will be pushed when triggered by events such as placing order, canceling order, transaction execution, etc. It will also be pushed in regular interval according to subscription granularity.

> Request Example: 
```json
{
    "op":"subscribe",
    "args":[
        {
            "channel":"copytrading-account"
        }
    ]
}
```

#### Request Parameters
Parameter | Type | Required | Description
----------------- | ----- | ------- | -----------
op | String | Yes | Operation, `subscribe` `unsubscribe` `error`
args | Array | Yes | List of subscribed channels
`>channel` | String | Yes | Channel name, `copytrading-account`

> Response Example:

```json
{
    "event": "subscribe",
    "arg": {
        "channel": "copytrading-account"
    }
}
```

> Failure Response Example:

```json
{
    "event": "error",
    "code": "60012",
    "msg": "Invalid request: {\"op\": \"subscribe\", \"args\":[{ \"channel\" : \"copytrading-account\"}]}"
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
event | String | Event, `subscribe` `unsubscribe` `error`
args | Object | Subscribed channel
`>channel` | String | Channel name
code | String | Error code
msg | String | Error message

> Push Data Example:

```json
{
  "arg": {
    "channel": "copytrading-account"
  },
  "data": {
    "ts": "1597026383085",
    "totalEquity": "41624.32",
    "isolatedEquity": "3624.32",
    "details": [
      {
        "currency": "USDT",
        "equity": "1",
        "balance": "1",
        "ts": "1617279471503",
        "isolatedEquity": "0",
        "equityUsd": "45078.3790756226851775",
        "availableEquity": "1",
        "available": "0",
        "frozen": "0",
        "orderFrozen": "0",
        "unrealizedPnl": "0",
        "isolatedUnrealizedPnl": "0"
        
      }
    ]
  }
}
```

#### Push Data Parameters
Parameter | Type | Description
----------------- | ----- | -----------
arg | Object | Successfully subscribed channel
`>channel` | String | Channel name
data | Object | Subscribed data
`>ts` | String |  Update time, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>totalEquity` | String | The total amount of equity in USD
`>isolatedEquity` | String | Isolated margin equity in USD
`>details` | String | Detailed asset information in all currencies
`>>currency` | String | Currency
`>>equity` | String | Equity of the currency
`>>balance` | String | Cash balance
`>>ts` | String | Update time of currency balance information, Unix timestamp format in milliseconds, e.g. `1597026383085`
`>>isolatedEquity` | String | Isolated margin equity of the currency
`>>available` | String | Available balance of the currency
`>>availableEquity` | String | Available equity of the currency
`>>frozen` | String | Frozen balance of the currency
`>>orderFrozen` | String | Margin frozen for open orders
`>>equityUsd` | String | Equity in USD of the currency
`>>isolatedUnrealizedPnl` | String | Isolated unrealized profit and loss of the currency





# User

 ## REST API

 ### GET API Key Info
Get the information of the api key. Use the api key pending to be checked to call the endpoint. 
#### HTTP Request

`GET /api/v1/user/query-apikey`

> Request Example:
```shell
GET /api/v1/user/query-apikey
```

> Response Example:

```json
{
  "code": "0",
  "msg": "success",
  "data": {
    "uid": "YOUR_USER_ID",
    "apiName": "read_test",
    "apiKey": "YOUR_API_KEY",
    "readOnly": 0,
    "ips": [
      "YOUR_IP_ADDRESS_1",
      "YOUR_IP_ADDRESS_2",
      
    ],
    "type": 1,
    "expireTime": "1597026383085",
    "createTime": "1597026383085",
    "referralCode": "blofin",
    "parentUid": "YOUR_PARENT_USER_ID",
  }
}
```

#### Response Parameters
Parameter | Type | Description
----------------- | ----- | -----------
referralCode | String | Referral code
uid | String | UID
apiName | String | API key name
apiKey | String | API key
readOnly | Integer | 0：Read and Write. 1：Read only
type | Integer | 1: Transaction, 2. Connect to third-party
expireTime | String | Expiration time, Unix timestamp format in milliseconds, e.g. `1597026383085`
createTime | String | Creation time, Unix timestamp format in milliseconds, e.g. `1597026383085`
ips | Array | IP bound
parentUid | String | if use sub account api key, it shows main account uid; if use main account api key, it shows “0”
