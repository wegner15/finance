# Statement AI Worker Contract

This project expects a service binding named `STATEMENT_AI` with two HTTP endpoints.

## 1) `POST /extract`

Request body:

```json
{
  "source": "mpesa",
  "password": "563540",
  "fileBase64": "<base64-pdf-bytes>"
}
```

Response body:

```json
{
  "transactions": [
    {
      "txDate": "2026-03-12T10:00:00.000Z",
      "description": "PayBill KPLC",
      "amount": 2500,
      "direction": "debit",
      "balance": 12000,
      "reference": "ABC123XYZ",
      "counterparty": "KPLC",
      "rawLine": "..."
    }
  ]
}
```

## 2) `POST /categorize`

Request body:

```json
{
  "transactions": [
    {
      "description": "PayBill KPLC",
      "amount": 2500,
      "direction": "debit",
      "counterparty": "KPLC"
    }
  ]
}
```

Response body:

```json
{
  "categories": [
    {
      "category": "Bills",
      "confidence": 0.94,
      "reason": "Utility bill payment"
    }
  ]
}
```
