// Import any necessary modules or classes from your SDK

import { formatString } from "./utils/format";

// Define your SDK class or interface if applicable
export class MySDK {
  constructor() {
    // Initialize your SDK here
  }

  // Add any methods or properties for your SDK
  // Example method:
  public sayHello(name: string): string {
    return `Hello, ${name}!`;
  }
}

// Example usage of your SDK
const formatted = formatString('Your message here');
console.log(`Formatted message: ${formatted}`);

const mySDKInstance = new MySDK();
const greeting = mySDKInstance.sayHello('John');
console.log(greeting);

// Export the instance of your SDK class if it's a singleton
export const mySDK = new MySDK();
