# Playwright Test Automation Framework Guide
## Comprehensive Principles & Patterns for GoodShop Testing

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Test Structure Philosophy](#2-test-structure-philosophy)
3. [Core Patterns](#3-core-patterns)
4. [API Testing Principles](#4-api-testing-principles)
5. [UI Testing Principles](#5-ui-testing-principles)
6. [Data Management](#6-data-management)
7. [Logging and Reporting](#7-logging-and-reporting)
8. [Code Review Guidelines](#8-code-review-guidelines)

---

## 1. Architecture Overview

### 1.1 Directory Structure

```
project-root/
├── src/
│   ├── api/                          # API layer implementation
│   │   ├── api-service.ts            # Base API service with fluent interface
│   │   ├── api-utils.ts              # Response validation utilities
│   │   └── goodshop-hub-v2/          # GoodShop API V2 implementation
│   │       ├── goodshop-api-v2.ts    # Main API service class
│   │       ├── helpers.ts            # Signature generation utilities
│   │       ├── constants/            # Endpoints, codes, schemas
│   │       │   ├── endpoints.ts
│   │       │   ├── request-types.ts
│   │       │   ├── response-codes.ts
│   │       │   └── response-schemas/ # Zod validation schemas
│   │       ├── models/               # Request body builders
│   │       ├── fixtures/             # Playwright fixtures
│   │       └── assertions/           # Custom assertion functions
│   │
│   ├── ui/                           # UI layer implementation
│   │   └── [application-name]/
│   │       ├── pages/                # Page objects
│   │       │   ├── base-page.ts
│   │       │   └── *-page.ts
│   │       ├── steps/                # Business workflow orchestration
│   │       │   └── ui-action-steps.ts
│   │       ├── fixtures/             # UI fixtures
│   │       └── test-data/            # UI test data
│   │
│   └── utils/                        # Shared utilities
│       ├── decorators.ts             # @step decorator
│       ├── data-generator.ts         # Random data generation
│       ├── datetime-utils.ts         # Date/time utilities
│       ├── array-utils.ts            # Array manipulation
│       └── environment-utils.ts      # Environment variable access
│
└── tests/
    ├── api/                          # API test suites
    │   └── goodshop-hub-v2/
    │       └── *.spec.ts
    └── ui/                           # UI test suites
        └── [application-name]/
            └── *.spec.ts
```

### 1.2 Layer Responsibilities

**API Layer:**
- Service classes encapsulate API endpoints
- Models build request bodies with defaults
- Helpers handle authentication and utilities
- Fixtures provide reusable API operations
- Assertions validate business logic

**UI Layer:**
- Page Objects encapsulate page elements and basic interactions
- Step Classes orchestrate page interactions into business workflows
- Fixtures provide page/step instances to tests
- Test Data provides locale/product-specific test data

**Utils Layer:**
- Decorators for Allure reporting
- Data generation for random test data
- Environment configuration management
- Shared utility functions

---

## 2. Test Structure Philosophy

### 2.1 Three-Layer Architecture

```
┌─────────────────────────────────┐
│         TEST LAYER              │  ← Test specifications (.spec.ts)
│   (Describe scenarios)          │  ← Arrange, Act, Assert
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│      STEP/WORKFLOW LAYER        │  ← Business logic orchestration
│   (Combine page/service calls)  │  ← Multi-page/API workflows
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│   PAGE OBJECT/SERVICE LAYER     │  ← Element interactions (UI)
│   (Atomic operations)           │  ← API endpoint calls (API)
└─────────────────────────────────┘
```

### 2.2 Separation of Concerns

**Tests Should:**
- Define test scenarios and expected outcomes
- Use step classes for multi-step workflows
- Directly use page objects only for single-page operations
- Focus on business logic, not implementation details
- Use descriptive test names with IDs

**Step Classes Should:**
- Orchestrate multiple page interactions
- Implement business workflows
- Handle cross-page navigation
- Contain assertions for multi-step verification
- Be decorated with `@step()` for reporting

**Page Objects Should:**
- Encapsulate page elements (locators)
- Provide atomic interaction methods
- Use `@step()` decorator for Allure reporting
- NOT contain business logic
- NOT navigate to other pages (except specialized navigation pages)

**Service Classes Should:**
- Encapsulate API endpoints
- Use fluent/chainable interface
- Handle authentication
- Provide typed request/response handling
- Use `@step()` decorator for reporting

---

## 3. Core Patterns

### 3.1 Fixture-Based Dependency Injection

**API Fixture Pattern:**

```typescript
// fixtures/setup-fixture.ts
import { test as base } from '@playwright/test';
import { GoodShopApiV2 } from '@api/goodshop-hub-v2/goodshop-api-v2';

type GoodShopApiV2Fixture = {
  api: GoodShopApiV2;
};

export const test = base.extend<GoodShopApiV2Fixture>({
  api: async ({ request }, use) => {
    const api = new GoodShopApiV2(request, 'BASE_URL_V1');
    await use(api);
  },
});
```

**Composite Fixture Pattern:**

```typescript
// fixtures/product-issue-fixtures.ts
type ProductIssueFixtures = {
  api: GoodShopApiV2;
  issueProduct: (params?: Partial<ProductIssueRequestBody>) => Promise<ProductIssueResponse>;
};

export const test = base.extend<ProductIssueFixtures>({
  api: async ({ request }, use) => {
    const api = new GoodShopApiV2(request, 'BASE_URL_V1');
    await use(api);
  },

  issueProduct: async ({ api }, use) => {
    const createProduct = async (params: Partial<ProductIssueRequestBody> = {}): Promise<ProductIssueResponse> => {
      const requestBody = buildProductIssueRequestBody(params);
      const response = await api.postProductIssue({ requestBody });
      const responseData = validateResponseSchema(ProductIssueResponseSchema, await response.json());
      expect(responseData).toHaveCorrectMessage(ResponseMessages.ProductIssue.CreatedSuccessfully);
      return responseData;
    };

    await use(createProduct);
  },
});
```

**UI Fixture Pattern:**

```typescript
// fixtures/ui-fixtures.ts
import { test as base } from '@playwright/test';
import { UIActionSteps } from '../steps/ui-action-steps';

type UIFixtures = {
  uiSteps: UIActionSteps;
};

export const test = base.extend<UIFixtures>({
  uiSteps: async ({ page }, use) => {
    const steps = new UIActionSteps(page);
    await use(steps);
  },
});
```

### 3.2 Fluent API Pattern (Chainable Interface)

**Base API Service:**

```typescript
export class APIService {
  private request: APIRequestContext;
  private baseURL: string;
  private apiPath: string = '';
  private apiQueryParams: Record<string, string | number | boolean> = {};
  private apiHeaders: { [key: string]: string } = {};
  private apiBody: object = {};

  constructor(request: APIRequestContext, envUrlKey: string, baseURL?: string) {
    this.request = request;
    this.baseURL = baseURL || process.env[envUrlKey] || '';
  }

  // Fluent methods - all return 'this' for chaining
  url(url: string): APIService {
    this.baseURL = url;
    return this;
  }

  path(pathTemplate: string): APIService {
    this.apiPath = pathTemplate;
    return this;
  }

  params(params: Record<string, string | number | boolean>): APIService {
    this.apiQueryParams = params;
    return this;
  }

  headers(headers: { [key: string]: string }): APIService {
    this.apiHeaders = { ...this.apiHeaders, ...headers };
    return this;
  }

  body(body?: object): APIService {
    this.apiBody = body;
    return this;
  }

  pathParam(params: Record<string, string | number>): APIService {
    Object.entries(params).forEach(([key, value]) => {
      this.apiPathParams[key] = value;
    });
    return this;
  }

  // Terminal methods - execute the request
  async getRequest(expectedStatus: number): Promise<APIResponse> {
    return this.executeRequest('get', expectedStatus);
  }

  async postRequest(expectedStatus: number): Promise<APIResponse> {
    return this.executeRequest('post', expectedStatus);
  }

  async putRequest(expectedStatus: number): Promise<APIResponse> {
    return this.executeRequest('put', expectedStatus);
  }

  async patchRequest(expectedStatus: number): Promise<APIResponse> {
    return this.executeRequest('patch', expectedStatus);
  }

  async deleteRequest(expectedStatus: number): Promise<APIResponse> {
    return this.executeRequest('delete', expectedStatus);
  }

  private async executeRequest(method: string, expectedStatus: number): Promise<APIResponse> {
    const url = this.buildURL();
    const options = { headers: this.apiHeaders, data: method !== 'get' ? this.apiBody : undefined };
    const response = await this.request[method](url, options);

    if (response.status() !== expectedStatus) {
      throw new Error(`Request to ${url} failed: Expected ${expectedStatus}, got ${response.status()}`);
    }

    return response;
  }
}
```

**Usage Example:**

```typescript
// Chained API call
const response = await this.setSignedRequest({
  method: 'POST',
  endpoint: Endpoints.productIssue,
  requestBody,
  useLong: false,
})
  .headers({ 'Custom-Header': 'value' })
  .params({ filter: 'active' })
  .postRequest(200);
```

### 3.3 Step Decorator Pattern

**Decorator Implementation:**

```typescript
// utils/decorators.ts
import test from '@playwright/test';

export function step(stepName?: string) {
  return function decorator<T extends (...args: unknown[]) => unknown>(
    target: T,
    context: ClassMethodDecoratorContext
  ) {
    return function replacementMethod(this: ThisParameterType<T>, ...args: Parameters<T>) {
      const name = stepName || `${this.constructor.name}.${context.name as string}`;
      return test.step(
        name,
        async () => {
          return await target.call(this, ...(args as Parameters<T>));
        },
        { box: true }
      );
    };
  };
}
```

**Usage in Page Objects:**

```typescript
export class ProductPage extends BasePage {
  @step('Select product amount')
  async selectAmount(amount: number): Promise<void> {
    await this.amountButton(amount).click();
  }

  @step('Fill recipient details')
  async fillRecipientDetails(name: string, email: string): Promise<void> {
    await this.fillRecipientName(name);
    await this.fillRecipientEmail(email);
  }
}
```

**Usage in Service Classes:**

```typescript
export class GoodShopApiV2 extends APIService {
  @step('Get list of vendors')
  async getVendors(filters = {}): Promise<APIResponse> {
    return this.setSignedRequest({
      method: 'GET',
      endpoint: Endpoints.vendors,
      queryParams: filters,
    }).getRequest(200);
  }

  @step('Issue digital product')
  async postProductIssue({ requestBody, expectedStatus = 200 }): Promise<APIResponse> {
    return await this.setSignedRequest({
      method: 'POST',
      endpoint: Endpoints.productIssue,
      requestBody,
    }).postRequest(expectedStatus);
  }
}
```

---

## 4. API Testing Principles

### 4.1 Service Layer Pattern

**Main Service Class Structure:**

```typescript
export class GoodShopApiV2 extends APIService {
  constructor(request: APIRequestContext, envUrlKey: string) {
    super(request, envUrlKey);

    // Set default headers
    this.headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'API-Key': getEnvironmentVariable('API_KEY'),
    });
  }

  // Private helper for signed requests
  private setSignedRequest({ method, endpoint, queryParams, requestBody, useLong, apiKey, secret }): GoodShopApiV2 {
    const timestamp = DateTimeUtils.getCurrentTimestamp();
    const signature = getSignature({ method, endpoint, timestamp, queryParams, requestBody, useLong, apiKey, secret });

    this.headers({ Signature: signature, Timestamp: timestamp })
      .path(endpoint)
      .params(queryParams || {})
      .body(requestBody);

    return this;
  }

  // Public endpoint methods
  @step('Get list of vendors')
  async getVendors({ filters = {}, apiKey, secret, expectedStatus = 200 } = {}): Promise<APIResponse> {
    return this.setSignedRequest({
      method: 'GET',
      endpoint: Endpoints.vendors,
      queryParams: filters,
      apiKey,
      secret,
    }).getRequest(expectedStatus);
  }

  @step('Issue digital product')
  async postProductIssue({ requestBody, useLong = false, expectedStatus = 200 }): Promise<APIResponse> {
    return await this.setSignedRequest({
      method: 'POST',
      endpoint: Endpoints.productIssue,
      requestBody,
      useLong,
    }).postRequest(expectedStatus);
  }

  // Variation methods for testing
  @step('Post product issue with inactive token')
  async postProductIssueWithInactiveToken(requestBody): Promise<APIResponse> {
    return await this.setSignedRequest({
      method: 'POST',
      endpoint: Endpoints.productIssue,
      requestBody,
      apiKey: getEnvironmentVariable('API_KEY_DISABLED'),
      secret: getEnvironmentVariable('SECRET_DISABLED'),
    }).postRequest(401);
  }

  @step('Post product issue with mismatch')
  async postProductIssueWithMismatch(
    requestBody,
    modifications: { override?: Partial<RequestBody>; remove?: keyof RequestBody },
    expectedStatus: number
  ): Promise<APIResponse> {
    const originalRequestBody = { ...requestBody };
    let modifiedRequestBody = { ...requestBody };

    if (modifications.override) {
      modifiedRequestBody = { ...modifiedRequestBody, ...modifications.override };
    }

    if (modifications.remove) {
      delete modifiedRequestBody[modifications.remove];
    }

    return await this.setSignedRequest({
      method: 'POST',
      endpoint: Endpoints.productIssue,
      requestBody: originalRequestBody, // Used for signature
    })
      .body(modifiedRequestBody) // Override body after signature
      .postRequest(expectedStatus);
  }

  // Polling pattern
  @step('Get order status')
  async getOrderStatus({ params = {}, waitForSuccess = false, expectedStatus = 200 } = {}): Promise<APIResponse> {
    const response = await this.setSignedRequest({
      method: 'GET',
      endpoint: Endpoints.orderStatus,
      queryParams: params,
    }).getRequest(expectedStatus);

    if (waitForSuccess) {
      let currentResponse = response;
      let attempts = 0;
      const maxAttempts = 5;
      const pollInterval = 3000;

      let currentResponseData = await currentResponse.json();

      do {
        if (currentResponseData.data.status === 'SUCCESS') break;

        attempts++;
        if (attempts >= maxAttempts) break;

        await new Promise((resolve) => setTimeout(resolve, pollInterval));

        currentResponse = await this.setSignedRequest({
          method: 'GET',
          endpoint: Endpoints.orderStatus,
          queryParams: params,
        }).getRequest(200);

        currentResponseData = await currentResponse.json();
      } while (currentResponseData.data.status !== 'SUCCESS' && attempts < maxAttempts);

      return currentResponse;
    }

    return response;
  }
}
```

### 4.2 Request Body Builder Pattern (Models)

**Model Structure:**

```typescript
// models/product-issue-model.ts
import { Vendors, Currency, DeliveryMethod } from '@api/common/product-data';
import { RandomDataGenerator } from '@utils/data-generator';

export type ProductIssueRequestBody = {
  client_request_id: string;
  vendor: string;
  face_value: {
    amount: number | string;
    currency: string;
  };
  delivery_method: string;
  fulfilment_by: string;
  fulfilment_parameters: {
    to_name: string;
    to_email: string;
    from_name: string;
    from_email: string;
    subject: string;
  };
  personalisation: {
    to_name: string;
    from_name: string;
    message: string;
    template: string;
  };
  sector: string;
};

export const defaultPersonalisation = {
  to_name: 'Recipient',
  from_name: 'Sender',
  message: 'Here is your product',
  template: 'standard',
};

export const defaultFulfilmentParameters = {
  to_name: 'Receiver',
  to_email: 'test@goodshop.io',
  from_name: 'Partner name',
  from_email: 'noreply@app.goodshop.io',
  subject: '[TestCode] Here is your product!',
};

export function buildProductIssueRequestBody(
  overrides: Partial<ProductIssueRequestBody> = {}
): Partial<ProductIssueRequestBody> {
  const clientRequestID = RandomDataGenerator.getRandomString();

  const body: ProductIssueRequestBody = {
    client_request_id: overrides.client_request_id ?? clientRequestID,
    vendor: overrides.vendor ?? Vendors.MOCK_VENDOR,
    face_value: overrides.face_value ?? { amount: 21.0, currency: Currency.GBP },
    delivery_method: overrides.delivery_method ?? DeliveryMethod.CODE,
    fulfilment_by: overrides.fulfilment_by ?? 'partner',
    sector: overrides.sector ?? Sectors.PRODUCT_MALL,
    ...(overrides.personalisation !== undefined && {
      personalisation: overrides.personalisation,
    }),
    ...(overrides.fulfilment_parameters !== undefined && {
      fulfilment_parameters: overrides.fulfilment_parameters,
    }),
  };

  return body;
}
```

**Dependent Request Body Builder:**

```typescript
// models/balance-check-model.ts
export type CheckBalanceCodeRequestBody = {
  client_request_id: string;
  vendor: string;
  face_value: {
    currency: string;
  };
  code: string;
  pin?: string;
};

export function buildCheckBalanceCodeRequestBody(
  originalResponse: ProductIssueCodeResponse,
  overrides: Partial<CheckBalanceCodeRequestBody> = {}
): Partial<CheckBalanceCodeRequestBody> {
  const clientRequestID = RandomDataGenerator.getRandomString();

  const body: CheckBalanceCodeRequestBody = {
    client_request_id: overrides.client_request_id ?? clientRequestID,
    vendor: overrides.vendor ?? originalResponse.data.vendor,
    face_value: overrides.face_value ?? { currency: originalResponse.data.face_value.currency },
    code: overrides.code ?? originalResponse.data.code,
    ...(originalResponse.data.pin && { pin: originalResponse.data.pin }),
  };

  return body;
}
```

### 4.3 Response Schema Validation (Zod)

**Base Response Schema:**

```typescript
// constants/response-schemas/base-response-schema.ts
import { z } from 'zod';

export const BaseResponseSchema = z.object({
  code: z.string(), // '000' for success, error codes otherwise
  status: z.string(), // 'success' or 'error'
  message: z.string(), // Human-readable message
});

export type BaseResponse = z.infer<typeof BaseResponseSchema>;
```

**Specific Response Schemas:**

```typescript
// constants/response-schemas/product-issue-response-schema.ts
import { z } from 'zod';
import { BaseResponseSchema } from './base-response-schema';

export const MoneyValueSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export const ProductIssueCodeResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    vendor: z.string(),
    code: z.string(),
    pin: z.string().optional(),
    face_value: MoneyValueSchema,
    cost_value: MoneyValueSchema,
    discount: z.number(),
    expiration_date: z.string(),
    reference: z.string(),
    float_balance: MoneyValueSchema,
  }),
});

export type ProductIssueCodeResponse = z.infer<typeof ProductIssueCodeResponseSchema>;

export const ProductIssueURLResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    vendor: z.string(),
    url: z.string(),
    face_value: MoneyValueSchema,
    cost_value: MoneyValueSchema,
    discount: z.number(),
    expiration_date: z.string(),
    reference: z.string(),
    float_balance: MoneyValueSchema,
  }),
});

export type ProductIssueURLResponse = z.infer<typeof ProductIssueURLResponseSchema>;
```

**Error Response Schema:**

```typescript
// constants/response-schemas/error-response-schema.ts
import { z } from 'zod';
import { BaseResponseSchema } from './base-response-schema';

export const ErrorResponseSchema = BaseResponseSchema.extend({
  data: z.record(z.string(), z.any()).optional(), // Field-level errors
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
```

**Validation Utility:**

```typescript
// api/api-utils.ts
import { z } from 'zod';
import { expect } from '@playwright/test';

export function validateResponseSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');
    expect.soft(result.success, `Schema validation failed:\n${errors}`).toBe(true);
  }

  return result.data;
}
```

### 4.4 Custom Matchers

**Matchers Implementation:**

```typescript
// fixtures/matchers.ts
import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
  toHaveCorrectMessage(received, expectedMessage: string) {
    const pass = received.status === 'success' && received.code === '000' && received.message === expectedMessage;
    return {
      pass,
      message: () => {
        const errors: string[] = [];
        if (received.status !== 'success') {
          errors.push(`expected status "success", received "${received.status}"`);
        }
        if (received.code !== '000') {
          errors.push(`expected code "000", received "${received.code}"`);
        }
        if (received.message !== expectedMessage) {
          errors.push(`expected message "${expectedMessage}", received "${received.message}"`);
        }
        return errors.join('\n');
      },
    };
  },

  toHaveSuccessfulStatus(received) {
    const pass = received.status === 'success' && received.code === '000';
    return {
      pass,
      message: () => {
        const errors: string[] = [];
        if (received.status !== 'success') {
          errors.push(`expected status "success", received "${received.status}"`);
        }
        if (received.code !== '000') {
          errors.push(`expected code "000", received "${received.code}"`);
        }
        return errors.join('\n');
      },
    };
  },

  toHaveCorrectErrorCodeAndMessage(received, expectedCode: string, expectedMessage: string) {
    const pass = received.status === 'error' && received.code === expectedCode && received.message === expectedMessage;
    return {
      pass,
      message: () => {
        const errors: string[] = [];
        if (received.status !== 'error') {
          errors.push(`expected status "error", received "${received.status}"`);
        }
        if (received.code !== expectedCode) {
          errors.push(`expected code "${expectedCode}", received "${received.code}"`);
        }
        if (received.message !== expectedMessage) {
          errors.push(`expected message "${expectedMessage}", received "${received.message}"`);
        }
        return errors.join('\n');
      },
    };
  },
});
```

### 4.5 Business Logic Assertions

**Assertion Functions:**

```typescript
// assertions/product-issue-assertions.ts
import { DeliveryMethod } from '@api/common/product-data';
import { ProductIssueCodeResponse, ProductIssueURLResponse } from '@response-schemas/product-issue-response-schema';
import { ProductIssueRequestBody } from '@models/product-issue-model';
import { expect } from '@playwright/test';

export function assertProductIssueSuccess(
  response: ProductIssueCodeResponse | ProductIssueURLResponse,
  request: Partial<ProductIssueRequestBody>
): void {
  expect.soft(response.data.vendor, 'Expected vendor to match request vendor slug').toBe(request.vendor);

  if (request.delivery_method === DeliveryMethod.CODE) {
    if ('code' in response.data) {
      expect.soft(response.data.code, 'Expected code to exist for CODE delivery method').toBeTruthy();
      expect.soft(response.data.code.length, 'Expected code to have reasonable length').toBeGreaterThan(0);
      expect.soft(response.data.pin, 'Expected pin property to exist').toBeDefined();
    }
  } else {
    if ('url' in response.data) {
      expect.soft(response.data.url, 'Expected URL to exist for URL delivery method').toBeTruthy();
      expect.soft(response.data.url.length, 'Expected URL to have reasonable length').toBeGreaterThan(0);
    }
  }

  const requestedAmount = request.face_value?.amount ?? 0;
  const prunedAmount = Math.floor(requestedAmount as number);
  expect
    .soft(response.data.face_value.amount, 'Expected face value amount to match request (decimals pruned)')
    .toBe(prunedAmount);
  expect.soft(response.data.face_value.currency, 'Expected face value currency to match request').toBe(
    request.face_value?.currency
  );

  const expectedCostValue = prunedAmount * (1 - response.data.discount / 100);
  expect.soft(response.data.cost_value.amount, 'Expected cost value to be face value minus discount').toBeCloseTo(
    expectedCostValue,
    2
  );
  expect.soft(response.data.cost_value.currency, 'Expected cost value currency to match request').toBe(
    request.face_value?.currency
  );

  expect.soft(response.data.discount, 'Expected discount to be a number').toEqual(expect.any(Number));
  expect.soft(response.data.discount, 'Expected discount to be between 0 and 100').toBeGreaterThanOrEqual(0);
  expect.soft(response.data.discount, 'Expected discount to be between 0 and 100').toBeLessThanOrEqual(100);

  expect.soft(response.data.expiration_date, 'Expected expiration date to exist').toBeTruthy();
  const expirationDate = new Date(response.data.expiration_date);
  const now = new Date();
  expect.soft(expirationDate.getTime(), 'Expected expiration date to be in the future').toBeGreaterThan(now.getTime());

  expect.soft(response.data.reference, 'Expected reference to exist').toBeTruthy();
  expect.soft(response.data.reference.length, 'Expected reference to be a non-empty string').toBeGreaterThan(0);

  expect.soft(response.data.float_balance.amount, 'Expected float balance amount to be a number').toEqual(
    expect.any(Number)
  );
  expect.soft(response.data.float_balance.currency, 'Expected float balance currency to exist').toBeTruthy();
  expect.soft(response.data.float_balance.currency, 'Expected float balance currency to typically match request').toBe(
    request.face_value?.currency
  );
}
```

### 4.6 Authentication & Context Management

**Signature-Based Authentication Pattern:**

```typescript
// helpers.ts
import { getEnvironmentVariable } from '@utils/environment-utils';
import * as crypto from 'crypto';

function getTransactionType(requestEndpoint: string): string {
  return requestEndpoint
    .replace(/^\/api\/v2\//, '')
    .split('?')[0]
    .replace(/\/$/, '')
    .replace(/\//g, '-');
}

function hmacShaTwoFiveSix(value: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export type GetSignatureParams = {
  method: string;
  endpoint: string;
  timestamp: string;
  queryParams?: Record<string, string | number | boolean>;
  requestBody?: Partial<RequestBody>;
  useLong?: boolean;
  apiKey?: string;
  secret?: string;
};

**Request-Level Context:**

1. **Headers Set at Initialization:**
   ```typescript
   this.headers({
     'Content-Type': 'application/json',
     Accept: 'application/json',
     'API-Key': getEnvironmentVariable('API_KEY'),
   });
   ```

3. **Authentication Variations:**
   - Default: Standard API key/secret
   - Disabled tokens: `API_KEY_DISABLED` / `SECRET_DISABLED`
   - Mismatch testing: Override credentials in method calls

### 4.7 Test Structure & Naming

**Test File Organization:**

```typescript
// tests/api/goodshop-hub-v2/product-issue.spec.ts
import { test } from '@fixtures-v2/setup-fixture';
import { expect } from '@fixtures-v2/matchers';
import { validateResponseSchema } from '@api/api-utils';
import { ProductIssueResponseSchema } from '@response-schemas/product-issue-response-schema';
import { buildProductIssueRequestBody } from '@models/product-issue-model';
import { Vendors, Currency } from '@api/common/product-data';
import { ErrorCodes, ErrorMessages, ResponseMessages } from '@constants/response-codes';

test.describe('[POST] /api/v2/product/issue - 000: Create product successfully', { tag: '@P1' }, () => {
  test('#101 [POST] /api/v2/product/issue - 000: Creates a product code', async ({ api }) => {
    const requestBody = buildProductIssueRequestBody();
    const response = await api.postProductIssue({ requestBody });

    const responseData = validateResponseSchema(ProductIssueResponseSchema, await response.json());

    expect(responseData).toHaveCorrectMessage(ResponseMessages.ProductIssue.CreatedSuccessfully);
    assertProductIssueSuccess(responseData, requestBody);
  });

  test('#102 [POST] /api/v2/product/issue - 000: Creates a product with long signature', async ({ api }) => {
    const requestBody = buildProductIssueRequestBody();
    const response = await api.postProductIssue({ requestBody, useLong: true });

    const responseData = validateResponseSchema(ProductIssueResponseSchema, await response.json());

    expect(responseData).toHaveCorrectMessage(ResponseMessages.ProductIssue.CreatedSuccessfully);
  });
});

test.describe('[POST] /api/v2/product/issue - Validation errors', { tag: '@P3' }, () => {
  test('#103 [POST] /api/v2/product/issue - 433: Missing client_request_id', async ({ api }) => {
    const requestBody = buildProductIssueRequestBody();
    const response = await api.postProductIssueWithMismatch(
      requestBody,
      { remove: 'client_request_id' },
      400
    );

    const responseData = validateResponseSchema(ErrorResponseSchema, await response.json());

    expect(responseData).toHaveCorrectErrorCodeAndMessage(
      ErrorCodes.ValidationError,
      ErrorMessages.Validation.MissingClientRequestId
    );
  });
});
```

**Multi-Step Workflow:**

```typescript
test('#201 Product lifecycle: Issue → Check Balance → Cancel', async ({ api, issueProduct }) => {
  // Step 1: Create product
  const created = await issueProduct({ vendor: Vendors.MOCK_VENDOR });

  // Step 2: Check Balance
  const balanceRequest = buildCheckBalanceCodeRequestBody(created);
  const balanceResponse = await api.postCheckBalance(balanceRequest);
  const balanceData = validateResponseSchema(CheckBalanceResponseSchema, await balanceResponse.json());
  expect(balanceData).toHaveSuccessfulStatus();

  // Step 3: Cancel product
  const cancelRequest = buildCancelProductRequestBody(created);
  const cancelResponse = await api.deleteProductIssue({ requestBody: cancelRequest });
  const cancelData = validateResponseSchema(CancelResponseSchema, await cancelResponse.json());
  expect(cancelData).toHaveCorrectMessage(ResponseMessages.Cancel.Success);
});
```

**Error/Validation Testing:**

```typescript
test('#301 Product issue with invalid amount', async ({ api }) => {
  const requestBody = buildProductIssueRequestBody({
    face_value: { amount: 25.2525, currency: Currency.GBP },
  });

  const response = await api.postProductIssueWithMismatch(
    requestBody,
    { override: { face_value: { amount: 'invalid', currency: Currency.GBP } } },
    400
  );

  const responseData = validateResponseSchema(ErrorResponseSchema, await response.json());

  expect(responseData).toHaveCorrectErrorCodeAndMessage(
    ErrorCodes.ValidationError,
    ErrorMessages.Validation.InvalidAmount
  );
});
```

**Polling Workflow:**

```typescript
test('#401 Order status polling until success', async ({ api }) => {
  const orderRequest = buildOrderProductRequestBody();
  const orderResponse = await api.postOrderProduct({ requestBody: orderRequest });
  const orderData = validateResponseSchema(OrderResponseSchema, await orderResponse.json());

  // Poll for order completion
  const statusResponse = await api.getOrderStatus({
    params: { client_request_id: orderRequest.client_request_id },
    waitForSuccess: true, // Polls up to 5 times, 3s intervals
    expectedStatus: 200,
  });

  const statusData = validateResponseSchema(OrderStatusResponseSchema, await statusResponse.json());
  expect(statusData.data.status).toBe('SUCCESS');
});
```

---

## 5. UI Testing Principles

### 5.1 Page Object Model (POM)

**Base Page Pattern:**

```typescript
// pages/base-page.ts
import { expect, Locator, Page } from '@playwright/test';
import { getEnvironmentVariable } from '@utils/environment-utils';
import { step } from '@utils/decorators';

export class BasePage {
  protected readonly uniqueElement: Locator;

  constructor(protected page: Page) {}

  @step('Navigate to page')
  async navigate(endpoint: string = ''): Promise<void> {
    const baseUrl = getEnvironmentVariable('BASE_URL');
    await this.page.goto(baseUrl + endpoint, { waitUntil: 'domcontentloaded' });
    await expect(this.uniqueElement).toBeVisible();
  }

  @step('Wait for page to load')
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.uniqueElement).toBeVisible();
  }
}
```

**Page Object Structure:**

```typescript
// pages/product-page.ts
import { BasePage } from './base-page';
import { expect, Locator } from '@playwright/test';
import ArrayUtils from '@utils/array-utils';
import { step } from '@utils/decorators';

export class ProductPage extends BasePage {
  // Unique element for page identification
  protected readonly uniqueElement = this.page.getByRole('link', { name: 'Add to Cart' });

  // Section 1: Element locators (private getters)
  // Simple locators
  private readonly cookiesOkButton = this.page.getByRole('button', { name: 'OK' });
  private readonly firstNameField = this.page.getByRole('textbox', { name: 'First Name*' });
  private readonly lastNameField = this.page.getByRole('textbox', { name: 'Last Name*' });
  private readonly recipientEmailField = this.page.getByRole('textbox', { name: "Recipient's Email*", exact: true });
  private readonly confirmEmailField = this.page.getByRole('textbox', { name: "Confirm Recipient's Email*" });
  private readonly messageField = this.page.getByRole('textbox', { name: 'Add an optional message' });
  private readonly designThumbnails = this.page.locator('.cardSelection li');
  private readonly addToCartButton = this.page.getByRole('link', { name: 'Add to Cart' });
  private readonly otherAmountOption = this.page.getByText('Other amount');
  private readonly otherAmountField = this.page.getByRole('textbox', { name: 'Insert amount between £5 and £500' });
  private readonly immediatelyOption = this.page.locator('li').filter({ hasText: 'Immediately' });
  private readonly laterDateOption = this.page.locator('li').filter({ hasText: 'Later Date' });

  // Parameterized locators (private methods)
  private readonly amountButton = (amount: number): Locator => this.page.getByText(`£${amount}`, { exact: true });

  // Section 2: Interaction methods (public, decorated)
  @step('Accept cookies')
  async acceptCookies(): Promise<void> {
    await this.cookiesOkButton.click();
    await expect(this.cookiesOkButton).toBeHidden();
  }

  @step('Select amount')
  async selectAmount(amount: number): Promise<void> {
    await this.amountButton(amount).click();
  }

  @step('Click other amount option')
  async clickOtherAmount(): Promise<void> {
    await this.otherAmountOption.click();
  }

  @step('Fill other amount')
  async fillOtherAmount(amount: number): Promise<void> {
    await this.otherAmountField.fill(amount.toString());
    await this.otherAmountField.blur();
  }

  @step('Fill custom amount')
  async fillCustomAmount(amount: number): Promise<void> {
    await this.clickOtherAmount();
    await this.fillOtherAmount(amount);
  }

  @step('Select random design')
  async selectRandomDesign(): Promise<string> {
    const allDesigns = await this.designThumbnails.all();
    const selectedDesign = ArrayUtils.getRandomElement(allDesigns);
    await selectedDesign.click();
    const text = (await selectedDesign.locator('img').getAttribute('alt')).trim();
    return text;
  }

  @step('Fill first name')
  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameField.fill(firstName);
    await this.firstNameField.blur();
  }

  @step('Fill last name')
  async fillLastName(lastName: string): Promise<void> {
    await this.lastNameField.fill(lastName);
    await this.lastNameField.blur();
  }

  @step('Fill recipient email')
  async fillRecipientEmail(email: string): Promise<void> {
    await this.recipientEmailField.fill(email);
    await this.recipientEmailField.blur();
  }

  @step('Fill confirm email')
  async fillConfirmEmail(email: string): Promise<void> {
    await this.confirmEmailField.fill(email);
    await this.confirmEmailField.blur();
  }

  @step('Fill message')
  async fillMessage(message: string): Promise<void> {
    await this.messageField.pressSequentially(message, { delay: 100 });
    await this.messageField.blur();
  }

  // Composite action (same page only)
  @step('Fill required recipient details')
  async fillRequiredRecipientDetails(firstName: string, lastName: string, email: string): Promise<void> {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillRecipientEmail(email);
    await this.fillConfirmEmail(email);
  }

  @step('Select immediate delivery')
  async selectDeliveryImmediately(): Promise<void> {
    await this.immediatelyOption.click();
  }

  @step('Select later date delivery')
  async selectDeliveryLaterDate(): Promise<void> {
    await this.laterDateOption.click();
  }

  @step('Click add to cart button')
  async clickAddToCart(): Promise<void> {
    await this.addToCartButton.waitFor({ state: 'visible' });
    await this.addToCartButton.click();
  }

  // Section 3: Assertion methods (public, decorated)
  @step('Assert immediately is selected')
  async assertImmediatelyIsSelected(): Promise<void> {
    await expect(this.immediatelyOption).toBeVisible();
  }
}
```

### 5.2 Locator Strategy & Best Practices

**Locator Priority Order:**

1. **Semantic/Accessible Locators (Preferred):**
   ```typescript
   this.page.getByRole('button', { name: 'Submit' })
   this.page.getByRole('textbox', { name: 'Email' })
   this.page.getByRole('link', { name: 'Add to Cart' })
   this.page.getByLabel('First Name')
   this.page.getByPlaceholder('Enter email')
   this.page.getByAltText('Product image')
   ```

2. **Text-Based Locators:**
   ```typescript
   this.page.getByText('Product details', { exact: true })
   this.page.getByText(/total: \$\d+/)
   ```

3. **Test IDs (Stable):**
   ```typescript
   this.page.getByTestId('submit-button')
   this.page.getByTestId('product-card')
   ```

4. **CSS Selectors (Last Resort):**
   ```typescript
   this.page.locator('.product-grid > .product-card')
   this.page.locator('#checkout-form')
   ```

**Locator Anti-Patterns (Avoid):**

```typescript
// ❌ Don't use XPath
this.page.locator('//div[@class="product"]//button[text()="Add to Cart"]')

// ❌ Don't use brittle selectors
this.page.locator('body > div:nth-child(3) > div > button:nth-child(2)')

// ❌ Don't use text without exact match when precision is needed
this.page.getByText('Submit') // May match "Submit Order", "Submit Payment", etc.

// ✅ Do use exact match
this.page.getByText('Submit', { exact: true })

// ❌ Don't hardcode indexes when semantic locators exist
this.page.locator('button').nth(2)

// ✅ Do use role with name
this.page.getByRole('button', { name: 'Add to Cart' })
```

**Parameterized Locators:**

```typescript
// Private method returning Locator
private readonly productCard = (productName: string): Locator =>
  this.page.getByRole('article', { name: productName });

private readonly amountButton = (amount: number): Locator =>
  this.page.getByRole('button', { name: `£${amount}` });

private readonly tableRow = (rowName: string): Locator =>
  this.page.getByRole('row', { name: new RegExp(rowName, 'i') });

// Usage
await this.productCard('Product A').click();
await this.amountButton(50).click();
```

### 5.3 Step Classes (Workflow Orchestration)

**Step Class Structure:**

```typescript
// steps/ui-action-steps.ts
import { step } from '@utils/decorators';
import { Page, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ProductPage } from '../pages/product-page';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';
import { SuccessPage } from '../pages/success-page';
import * as testData from '../test-data/storefront-test-data.json';

export class UIActionSteps {
  constructor(private page: Page) {}

  // Private getters for page instances
  private get homePage(): HomePage {
    return new HomePage(this.page);
  }

  private get productPage(): ProductPage {
    return new ProductPage(this.page);
  }

  public get cartPage(): CartPage {
    return new CartPage(this.page);
  }

  private get checkoutPage(): CheckoutPage {
    return new CheckoutPage(this.page);
  }

  private get successPage(): SuccessPage {
    return new SuccessPage(this.page);
  }

  // Navigation workflows
  @step('Navigate to storefront')
  async navigateToStorefront(): Promise<void> {
    await this.homePage.navigate();
  }

  @step('Navigate directly to product page')
  async navigateToProductPage(productSlug: string): Promise<void> {
    const baseUrl = process.env.BASE_URL;
    const productUrl = `${baseUrl}/product/${productSlug}`;
    await this.page.goto(productUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Cookie handling
  @step('Accept cookie')
  async acceptCookie(): Promise<void> {
    await this.homePage.clickOnCookieBannerAcceptButton();
  }

  // Search workflow
  @step('Search for product')
  async searchForProduct(productName: string): Promise<void> {
    await this.homePage.searchForProduct(productName);
  }

  @step('Select product')
  async selectProduct(): Promise<void> {
    await this.homePage.clickOnProduct();
  }

  // Product selection workflow
  @step('Capture product details')
  async captureProductDetails(amount: string, quantity: string): Promise<void> {
    await this.productPage.enterAmount(amount);
    await this.productPage.selectQuantity(quantity);
  }

  @step('Capture denominated product details')
  async captureDenominatedProductDetails(amount: string, quantity: string): Promise<void> {
    await this.productPage.selectPredefinedAmount(amount);
    await this.productPage.selectQuantity(quantity);
  }

  @step('Click on add to cart')
  async clickAddToCart(): Promise<void> {
    await this.productPage.clickAddToCart();
  }

  @step('Go to cart')
  async goToCart(): Promise<void> {
    await this.productPage.goToCart();
  }

  // Checkout workflow
  @step('Go to checkout from cart')
  async goToCheckout(): Promise<void> {
    await this.cartPage.clickOnCheckOut();
  }

  @step('Checkout product')
  async checkoutProduct(
    firstName: string,
    lastName: string,
    email: string,
    paymentMethod: PaymentType
  ): Promise<void> {
    await this.checkoutPage.enterFirstName(firstName);
    await this.checkoutPage.enterLastName(lastName);
    await this.checkoutPage.enterEmail(email);
    await this.checkoutPage.clickOnTermsAndConditions();
    await this.checkoutPage.clickOnContinue();
    await this.checkoutPage.selectPaymentMethod(paymentMethod);
  }

  @step('Process payment with test card')
  async processPayment(): Promise<void> {
    await this.stripePage.captureCardDetails(
      testData.card.number,
      testData.card.expiry,
      testData.card.cvc,
      testData.card.billingName,
      testData.card.billingCountry,
      testData.card.zipCode
    );
    await this.stripePage.clickOnPayButton();
  }

  // Assertions
  @step('Assert success page details')
  async assertSuccessPage(expectedTotal: string, name: string, price: string): Promise<void> {
    expect(await this.successPage.getSuccessHeader()).toBe(testData.successPage.successHeader);
    expect(await this.successPage.getOrderNumber()).not.toBeNull();
    expect(await this.successPage.getProductName()).toBe(name);
    expect(await this.successPage.getProductPrice()).toBe(`£${price}`);

    const orderDateTime = await this.successPage.getOrderDate();
    const orderDate = orderDateTime.split(',')[0].trim();
    const expectedDate = DateTimeUtils.getFormattedDate('en-GB');

    expect(orderDate).toBe(expectedDate);
    expect(await this.successPage.getTotalAmount()).toBe(`£${expectedTotal}`);
  }

  @step('Assert product name')
  async assertProductName(productName: string): Promise<void> {
    expect(await this.homePage.getProductName()).toBe(productName);
  }

  @step('Assert total price')
  async assertTotalPrice(totalPrice: string): Promise<void> {
    expect(await this.cartPage.getTotalPrice()).toBe('£' + totalPrice);
  }

  @step('Assert maximum amount error validation on product page')
  async assertMaximumAmountErrorValidation(labelErrorMessage: string, maximumAmountErrorMessage: string): Promise<void> {
    expect(await this.productPage.getLabelErrorMessage()).toBe(labelErrorMessage);
    expect(await this.productPage.getMaximumAmountErrorMessage()).toBe(maximumAmountErrorMessage);
  }

  // Complex workflows
  @step('Complete product purchase')
  async completeProductPurchase(
    productName: string,
    amount: string,
    quantity: string,
    customerDetails: { firstName: string; lastName: string; email: string }
  ): Promise<void> {
    await this.searchForProduct(productName);
    await this.selectProduct();
    await this.captureProductDetails(amount, quantity);
    await this.clickAddToCart();
    await this.goToCart();
    await this.goToCheckout();
    await this.checkoutProduct(
      customerDetails.firstName,
      customerDetails.lastName,
      customerDetails.email,
      PaymentType.CARD
    );
    await this.processPayment();
  }
}
```

**When to Use Step Classes:**

✅ **Use Step Classes for:**
- Multi-page workflows (navigate → select → checkout → verify)
- Complex business scenarios (complete purchase flow)
- Workflows requiring multiple page interactions
- Assertions spanning multiple pages
- Reusable business operations

❌ **Don't Use Step Classes for:**
- Single page interactions (use page object directly)
- Simple element interactions (use page object methods)
- One-off operations not reused elsewhere

**Example Test Using Steps:**

```typescript
// tests/ui/purchase-flow.spec.ts
import { test } from '@fixtures/ui-fixtures';
import { expect } from '@playwright/test';

test.describe('Product Purchase Flow', () => {
  test('Complete purchase with standard amount', async ({ uiSteps }) => {
    // Setup
    await uiSteps.navigateToStorefront();
    await uiSteps.acceptCookie();

    // Execute
    await uiSteps.completeProductPurchase(
      'Test Product',
      '50',
      '1',
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
      }
    );

    // Verify
    await uiSteps.assertSuccessPage('50', 'Test Product', '50');
  });

  test('Add product to cart and verify total', async ({ uiSteps }) => {
    await uiSteps.navigateToStorefront();
    await uiSteps.searchForProduct('Test Product');
    await uiSteps.selectProduct();
    await uiSteps.captureProductDetails('25', '2');
    await uiSteps.clickAddToCart();
    await uiSteps.goToCart();
    await uiSteps.assertTotalPrice('50');
  });
});
```

### 5.4 Assertion Patterns

**Soft vs. Hard Assertions:**

```typescript
// ✅ Use soft assertions for multiple checks in business logic
export function assertProductDetails(response, request): void {
  expect.soft(response.vendor, 'Vendor should match').toBe(request.vendor);
  expect.soft(response.amount, 'Amount should match').toBe(request.amount);
  expect.soft(response.currency, 'Currency should match').toBe(request.currency);
  expect.soft(response.code, 'Code should exist').toBeTruthy();
  expect.soft(response.expiration_date, 'Expiration should be future').toBeGreaterThan(new Date());
}

// ✅ Use hard assertions for critical checks
test('User can login', async ({ page }) => {
  await loginPage.login('user@test.com', 'password');
  // Hard assertion - test should fail immediately if not on dashboard
  await expect(page).toHaveURL('/dashboard');
});

// ❌ Don't mix soft and hard in critical flows without intention
// This will continue even if URL is wrong, potentially causing confusing failures later
test('Complete checkout', async ({ page }) => {
  await checkoutPage.submitOrder();
  expect.soft(page.url()).toContain('/success'); // ❌ Should be hard assertion
  await successPage.downloadReceipt(); // Will fail if not on success page
});
```

**Custom Assertion Messages:**

```typescript
// ✅ Always provide custom messages for business logic assertions
expect.soft(response.data.vendor, 'Expected vendor to match request vendor slug').toBe(request.vendor);

expect.soft(response.data.face_value.amount, 'Expected face value amount to match request (decimals pruned)').toBe(
  prunedAmount
);

expect
  .soft(response.data.cost_value.amount, 'Expected cost value to be face value minus discount')
  .toBeCloseTo(expectedCostValue, 2);

// ❌ Don't use assertions without messages for complex checks
expect.soft(response.data.vendor).toBe(request.vendor); // What does this check?
```

**Assertion Organization:**

```typescript
// ✅ Group related assertions in functions
function assertOrderSummary(order, expected): void {
  // Product details
  expect.soft(order.productName, 'Product name should match').toBe(expected.productName);
  expect.soft(order.productPrice, 'Product price should match').toBe(expected.productPrice);

  // Pricing calculation
  expect.soft(order.subtotal, 'Subtotal should be correct').toBe(expected.subtotal);
  expect.soft(order.discount, 'Discount should be applied').toBe(expected.discount);
  expect.soft(order.total, 'Total should be subtotal minus discount').toBe(expected.subtotal - expected.discount);

  // Order metadata
  expect.soft(order.orderNumber, 'Order number should exist').toBeTruthy();
  expect.soft(order.orderDate, 'Order date should be today').toBe(DateTimeUtils.getFormattedDate('en-GB'));
}

// ❌ Don't scatter related assertions across test
test('Verify order', async ({ uiSteps }) => {
  // ... lots of code ...
  expect(order.productName).toBe('Product A');
  // ... more code ...
  expect(order.total).toBe(50);
  // ... even more code ...
  expect(order.orderNumber).toBeTruthy();
});
```

### 5.5 Synchronization Best Practices

**Waiting Patterns:**

```typescript
// ✅ Wait for specific conditions
await expect(this.submitButton).toBeVisible();
await expect(this.loadingSpinner).toBeHidden();
await this.page.waitForURL('/success');
await this.page.waitForLoadState('domcontentloaded');
await this.page.waitForResponse((response) => response.url().includes('/api/checkout'));

// ✅ Built-in auto-waiting with Playwright actions
await this.submitButton.click(); // Waits for actionability
await this.emailField.fill('test@example.com'); // Waits for element to be editable

// ❌ NEVER use arbitrary timeouts
await this.page.waitForTimeout(5000); // ❌ Flaky and slow

// ❌ Don't use sleep/delay in production tests
await new Promise((resolve) => setTimeout(resolve, 3000)); // ❌ Brittle
```

**Handling Dynamic Content:**

```typescript
// ✅ Wait for network idle for dynamic content
await this.page.waitForLoadState('networkidle');

// ✅ Wait for specific API responses
const responsePromise = this.page.waitForResponse((response) =>
  response.url().includes('/api/products') && response.status() === 200
);
await this.searchButton.click();
await responsePromise;

// ✅ Poll for condition with retry logic (rare cases)
async waitForOrderStatus(expectedStatus: string, maxAttempts: number = 5): Promise<void> {
  let attempts = 0;
  const pollInterval = 3000;

  while (attempts < maxAttempts) {
    const status = await this.getOrderStatus();
    if (status === expectedStatus) return;

    attempts++;
    if (attempts >= maxAttempts) {
      throw new Error(`Order status did not reach ${expectedStatus} after ${maxAttempts} attempts`);
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}
```

**Form Handling:**

```typescript
// ✅ Fill and blur for validation triggers
@step('Fill email field')
async fillEmail(email: string): Promise<void> {
  await this.emailField.fill(email);
  await this.emailField.blur(); // Trigger validation
}

// ✅ Wait for validation messages
@step('Assert email validation error')
async assertEmailValidationError(expectedMessage: string): Promise<void> {
  await expect(this.emailErrorMessage).toBeVisible();
  expect(await this.emailErrorMessage.textContent()).toBe(expectedMessage);
}

// ✅ Sequential input with delay for special cases
@step('Fill message with typing effect')
async fillMessage(message: string): Promise<void> {
  await this.messageField.pressSequentially(message, { delay: 100 });
  await this.messageField.blur();
}
```

---

## 6. Data Management

### 6.1 Test Data Organization

**Common Product Data:**

```typescript
// common/product-data.ts
export const Vendors = {
  MOCK_VENDOR: 'mock-vendor',
  VENDOR_A: 'vendor-a',
  VENDOR_B: 'vendor-b',
  NO_CANCELLATION: 'no-cancellation-vendor',
  PAUSED: 'paused-vendor',
  NON_EXISTENT: 'non-existent-vendor',
} as const;

export const Currency = {
  GBP: 'GBP',
  EUR: 'EUR',
  USD: 'USD',
  AUD: 'AUD',
  NON_EXISTENT: 'XXX',
} as const;

export const DeliveryMethod = {
  CODE: 'code',
  URL: 'url',
  EMAIL: 'email',
  INVALID: 'invalid',
} as const;

export const Countries = {
  GB: 'GB',
  US: 'US',
  FR: 'FR',
} as const;

export const Categories = {
  FASHION: 'fashion',
  ELECTRONICS: 'electronics',
  FOOD: 'food',
} as const;

export const Sectors = {
  PRODUCT_MALL: 'product-mall',
  NONEXISTENT: 'nonexistent-sector',
} as const;
```

**Locale-Specific Test Data (JSON):**

```json
// ui/storefront/test-data/storefront-test-data.json
{
  "card": {
    "number": "4242424242424242",
    "expiry": "12/34",
    "cvc": "123",
    "billingName": "Test User",
    "billingCountry": "United Kingdom",
    "zipCode": "SW1A 1AA"
  },
  "successPage": {
    "successHeader": "Order confirmed"
  },
  "validationMessages": {
    "emailRequired": "Email is required",
    "emailInvalid": "Please enter a valid email address",
    "amountTooHigh": "Maximum amount is £500",
    "amountTooLow": "Minimum amount is £5"
  }
}
```

**Invalid Test Data:**

```typescript
// common/test-data.ts
export const InvalidData = {
  CLIENT_REQUEST_ID: 'Ab1!',
  AMOUNT: 25.2525, // Invalid decimal places
  VENDOR: 'non-existent-vendor',
  EMAIL: 'invalid-email',
  NEGATIVE_AMOUNT: -10,
} as const;
```

### 6.2 Data Generation Utilities

**Random Data Generator:**

```typescript
// utils/data-generator.ts
export class RandomDataGenerator {
  static getRandomString(length: number = 16): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
  }

  static getRandomNumber(min: number = 1, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRandomEmail(domain: string = 'test.com'): string {
    return `test.${this.getRandomString(8)}@${domain}`;
  }

  static getRandomAmount(min: number = 5, max: number = 500): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRandomDate(daysFromNow: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * daysFromNow));
    return date.toISOString().split('T')[0];
  }

  static getRandomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
```

**Date/Time Utilities:**

```typescript
// utils/datetime-utils.ts
export class DateTimeUtils {
  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  static getFormattedDate(locale: string = 'en-GB'): string {
    return new Date().toLocaleDateString(locale);
  }

  static getFormattedDateTime(locale: string = 'en-GB'): string {
    return new Date().toLocaleString(locale);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isFutureDate(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  static formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
```

**Array Utilities:**

```typescript
// utils/array-utils.ts
export default class ArrayUtils {
  static getRandomElement<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Array is empty');
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

### 6.3 Environment Configuration

**Environment Variable Access:**

```typescript
// utils/environment-utils.ts
export function getEnvironmentVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value.trim();
}

export function getOptionalEnvironmentVariable(key: string, defaultValue: string = ''): string {
  return process.env[key]?.trim() || defaultValue;
}

export function isEnvironment(env: string): boolean {
  return getOptionalEnvironmentVariable('ENV', 'dev') === env;
}
```

**Configuration Files:**

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,

  use: {
    baseURL: process.env.BASE_URL || 'https://test.goodshop.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: process.env.BASE_URL_V1 || 'https://api.goodshop.com',
      },
    },
    {
      name: 'ui-tests',
      testMatch: /.*\.ui\.spec\.ts/,
      use: {
        baseURL: process.env.BASE_URL || 'https://test.goodshop.com',
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  reporter: [
    ['html'],
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
});
```

**Environment-Specific Configuration:**

```bash
# .env.dev
BASE_URL=https://dev.goodshop.com
BASE_URL_V1=https://api-dev.goodshop.com
API_KEY=dev-api-key
SECRET=dev-secret
API_KEY_DISABLED=disabled-key
SECRET_DISABLED=disabled-secret

# .env.staging
BASE_URL=https://staging.goodshop.com
BASE_URL_V1=https://api-staging.goodshop.com
API_KEY=staging-api-key
SECRET=staging-secret

# .env.prod
BASE_URL=https://www.goodshop.com
BASE_URL_V1=https://api.goodshop.com
API_KEY=prod-api-key
SECRET=prod-secret
```

---

**Test Metadata:**

```typescript
import { test } from '@fixtures/setup-fixture';

test.describe('Product Purchase Flow', () => {
  test('#101 Complete purchase with standard amount', async ({ uiSteps }) => {
    // Test implementation
  });
});
```
**Custom Screenshot Handling:**

```typescript
// steps/ui-action-steps.ts
@step('Take screenshot of cart')
async captureCartScreenshot(name: string = 'cart'): Promise<void> {
  await test.info().attach(name, {
    body: await this.page.screenshot(),
    contentType: 'image/png',
  });
}

@step('Capture page state on error')
async captureErrorState(): Promise<void> {
  await test.info().attach('error-screenshot', {
    body: await this.page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  await test.info().attach('page-html', {
    body: await this.page.content(),
    contentType: 'text/html',
  });

  await test.info().attach('page-url', {
    body: this.page.url(),
    contentType: 'text/plain',
  });
}
```

### 7.4 API Request/Response Logging

**Request Logging:**

```typescript
// api/api-service.ts
private async executeRequest(method: string, expectedStatus: number): Promise<APIResponse> {
  const url = this.buildURL();
  const options = {
    headers: this.apiHeaders,
    data: method !== 'get' ? this.apiBody : undefined,
  };

  console.log(`[API ${method.toUpperCase()}] ${url}`);
  console.log(`[API Request Headers]`, JSON.stringify(this.apiHeaders, null, 2));
  if (options.data) {
    console.log(`[API Request Body]`, JSON.stringify(options.data, null, 2));
  }

  const response = await this.request[method](url, options);

  console.log(`[API Response Status] ${response.status()}`);

  if (response.status() !== expectedStatus) {
    const responseBody = await response.json();
    console.error(`[API Response Body]`, JSON.stringify(responseBody, null, 2));
    throw new Error(`Request to ${url} failed: Expected ${expectedStatus}, got ${response.status()}`);
  }

  return response;
}
```

**Attaching API Responses to Reports:**

```typescript
@step('Issue product and attach response')
async issueProductWithLogging(requestBody): Promise<ProductIssueResponse> {
  const response = await this.api.postProductIssue({ requestBody });
  const responseData = await response.json();

  // Attach to Allure report
  await test.info().attach('api-request', {
    body: JSON.stringify(requestBody, null, 2),
    contentType: 'application/json',
  });

  await test.info().attach('api-response', {
    body: JSON.stringify(responseData, null, 2),
    contentType: 'application/json',
  });

  return validateResponseSchema(ProductIssueResponseSchema, responseData);
}
```

---

## 8. Code Review Guidelines

### 8.1 API Test Review Checklist

**Service Layer:**
- [ ] All public methods use `@step()` decorator
- [ ] Methods have clear, descriptive names
- [ ] Default parameters are provided where appropriate
- [ ] Expected status codes are explicit (not magic numbers)
- [ ] Error handling variations exist (disabled tokens, mismatches)
- [ ] Fluent API pattern is used correctly (method chaining)
- [ ] Authentication is handled consistently

**Request Models:**
- [ ] Type definitions are complete and accurate
- [ ] Default values are provided for all fields
- [ ] Override mechanism works correctly
- [ ] Random data generation is used appropriately
- [ ] Dependent models correctly extract data from previous responses
- [ ] Optional fields are handled with conditional spreading

**Response Schemas:**
- [ ] Zod schemas match actual API responses
- [ ] Base response schema is extended, not duplicated
- [ ] Optional fields are marked with `.optional()`
- [ ] Types are inferred from schemas using `z.infer<>`
- [ ] Nested objects use reusable schemas (e.g., `MoneyValueSchema`)

**Assertions:**
- [ ] Custom matchers are used for common checks
- [ ] Soft assertions are used for multiple business logic checks
- [ ] Hard assertions are used for critical flow checks
- [ ] Custom messages explain what is being validated
- [ ] Assertion functions group related checks
- [ ] Expected values are compared against request data

**Test Structure:**
- [ ] Test names follow convention: `#[ID] [METHOD] [endpoint] - [Code]: [Description]`
- [ ] Tests are grouped by success/error scenarios
- [ ] Appropriate tags are used (@P1, @P2, @P3)
- [ ] Fixtures are used for reusable operations
- [ ] Test data is externalized (constants, models)
- [ ] Tests are independent and can run in any order

### 8.2 UI Test Review Checklist

**Page Objects:**
- [ ] Extends `BasePage`
- [ ] Has unique element for page identification
- [ ] Locators use semantic selectors (role, label, text) over CSS
- [ ] Locators are private and readonly
- [ ] Parameterized locators are private methods returning `Locator`
- [ ] Methods are public, async, and use `@step()` decorator
- [ ] Methods have clear, action-oriented names
- [ ] No business logic in page objects (only interactions)
- [ ] No navigation to other pages (except navigation-specific pages)
- [ ] Assertions in page objects are minimal (element visibility only)

**Step Classes:**
- [ ] Constructor accepts `Page` parameter
- [ ] Page instances are private getters (lazy initialization)
- [ ] Methods use `@step()` decorator
- [ ] Methods orchestrate multiple page interactions
- [ ] Methods contain business logic and workflows
- [ ] Assertions for multi-step verification are included
- [ ] Methods have descriptive names reflecting business actions
- [ ] Reusable workflows are extracted to step methods

**Locators:**
- [ ] Priority order followed: Role > Label > Text > TestId > CSS
- [ ] `{ exact: true }` used when needed to avoid partial matches
- [ ] No XPath locators
- [ ] No brittle selectors (nth-child, sibling traversal)
- [ ] Parameterized locators for dynamic elements
- [ ] Clear variable names for locators

**Assertions:**
- [ ] Soft assertions for multiple related checks
- [ ] Hard assertions for critical flow checks
- [ ] Custom messages for all business logic assertions
- [ ] Grouped related assertions in functions
- [ ] Clear expected values (no magic strings/numbers)

**Synchronization:**
- [ ] No `waitForTimeout()` or arbitrary delays
- [ ] Built-in auto-waiting is leveraged (click, fill, etc.)
- [ ] Explicit waits for specific conditions (`toBeVisible`, `toBeHidden`)
- [ ] `waitForLoadState()` used for page transitions
- [ ] `waitForResponse()` used for API-dependent UI updates
- [ ] Polling logic only when absolutely necessary (with retry limits)

**Test Structure:**
- [ ] Tests use step classes for multi-page workflows
- [ ] Tests use page objects directly for single-page operations
- [ ] Arrange-Act-Assert pattern is clear
- [ ] Test data is externalized (JSON, constants)
- [ ] Tests are independent and can run in parallel

### 8.3 General Code Quality

**Naming Conventions:**
- [ ] Classes: PascalCase (`ProductPage`, `UIActionSteps`, `GoodShopApiV2`)
- [ ] Methods: camelCase (`selectAmount`, `fillRecipientDetails`)
- [ ] Constants: UPPER_SNAKE_CASE (`MOCK_VENDOR`, `API_KEY`)
- [ ] Private fields: prefixed with `_` or use TypeScript `private` keyword
- [ ] Descriptive names (no abbreviations unless widely known)

**TypeScript Usage:**
- [ ] Explicit types for function parameters and return values
- [ ] Interfaces/Types for complex objects
- [ ] `Partial<>` for optional overrides
- [ ] `Readonly<>` for immutable objects
- [ ] `as const` for constant objects
- [ ] No `any` type (use `unknown` if truly dynamic)

**Documentation:**
- [ ] JSDoc comments for public APIs
- [ ] Inline comments for complex logic
- [ ] README files for major components
- [ ] Examples in documentation
- [ ] Clear error messages in assertions

**Code Reusability:**
- [ ] Common logic extracted to utilities
- [ ] Page object methods are atomic and reusable
- [ ] Step methods combine page interactions for workflows
- [ ] Fixtures provide reusable setup/teardown
- [ ] Constants/models prevent duplication

**Performance:**
- [ ] No unnecessary waits or sleeps
- [ ] Parallel execution where possible
- [ ] Efficient locators (avoid multiple DOM queries)
- [ ] Lazy initialization of page instances
- [ ] Proper use of fixtures (setup once, use many times)

**Error Handling:**
- [ ] Meaningful error messages
- [ ] Failed assertions include context
- [ ] API errors include request/response details
- [ ] Validation failures show schema errors
- [ ] Proper use of try-catch only when necessary

---

## Appendix: Common Patterns Quick Reference

### API Test Pattern

```typescript
test('#101 [POST] /api/v2/product/issue - 000: Creates a product code', async ({ api }) => {
  // Arrange
  const requestBody = buildProductIssueRequestBody({ vendor: Vendors.MOCK_VENDOR });

  // Act
  const response = await api.postProductIssue({ requestBody });
  const responseData = validateResponseSchema(ProductIssueResponseSchema, await response.json());

  // Assert
  expect(responseData).toHaveCorrectMessage(ResponseMessages.ProductIssue.CreatedSuccessfully);
  assertProductIssueSuccess(responseData, requestBody);
});
```

### UI Test Pattern

```typescript
test('Complete product purchase flow', async ({ uiSteps }) => {
  // Arrange
  await uiSteps.navigateToStorefront();
  await uiSteps.acceptCookie();

  // Act
  await uiSteps.completeProductPurchase('Test Product', '50', '1', {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
  });

  // Assert
  await uiSteps.assertSuccessPage('50', 'Test Product', '50');
});
```

### Multi-Step Workflow Pattern

```typescript
test('Product lifecycle: Issue → Check → Cancel', async ({ api, issueProduct }) => {
  // Step 1: Create
  const created = await issueProduct({ vendor: Vendors.MOCK_VENDOR });

  // Step 2: Verify
  const balanceRequest = buildCheckBalanceCodeRequestBody(created);
  const balance = await api.postCheckBalance(balanceRequest);
  const balanceData = validateResponseSchema(CheckBalanceResponseSchema, await balance.json());
  expect(balanceData).toHaveSuccessfulStatus();

  // Step 3: Cleanup
  const cancelRequest = buildCancelProductRequestBody(created);
  const cancel = await api.deleteProductIssue({ requestBody: cancelRequest });
  const cancelData = validateResponseSchema(CancelResponseSchema, await cancel.json());
  expect(cancelData).toHaveCorrectMessage(ResponseMessages.Cancel.Success);
});
```

### Fixture Composition Pattern

```typescript
export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    const api = new GoodShopApiV2(request, 'BASE_URL_V1');
    await use(api);
  },

  issueProduct: async ({ api }, use) => {
    const createProduct = async (params = {}): Promise<ProductIssueResponse> => {
      const requestBody = buildProductIssueRequestBody(params);
      const response = await api.postProductIssue({ requestBody });
      const responseData = validateResponseSchema(ProductIssueResponseSchema, await response.json());
      expect(responseData).toHaveCorrectMessage(ResponseMessages.ProductIssue.CreatedSuccessfully);
      return responseData;
    };
    await use(createProduct);
  },
});
```

---

**End of Guide**

This comprehensive guide covers all architectural patterns, best practices, and implementation details for building a robust Playwright test automation framework. Use this as a reference when developing new tests or refactoring existing ones to ensure consistency and maintainability across the entire test suite.
