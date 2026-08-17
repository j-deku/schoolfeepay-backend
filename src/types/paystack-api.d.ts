// types/paystack-api.d.ts
/// <reference path="./types/paystack-api.d.ts" />
declare module "paystack-api" {
  interface InitializeResponse {
    status: boolean;
    data: {
      authorization_url: string;
    };
  }

  class Paystack {
    constructor(secret: string);
    transaction: {
      initialize(data: {
        email: string;
        amount: number;
        callback_url?: string;
      }): Promise<InitializeResponse>;
    };
  }

  export default Paystack;
}
