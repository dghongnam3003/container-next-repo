"use client";

// Advanced CommonJS to ES Module converter for browser environments
class CommonJSConverter {
  private static setupGlobalPolyfills() {
    if (typeof window !== 'undefined') {
      // Create a more sophisticated exports handler
      const createExportsProxy = () => {
        const exports: Record<string, unknown> = {};
        return new Proxy(exports, {
          set(target, property, value) {
            target[property as string] = value;
            return true;
          },
          get(target, property) {
            return target[property as string];
          }
        });
      };

      if (!(globalThis as any).exports) {
        (globalThis as any).exports = createExportsProxy();
      }
      
      if (!(globalThis as any).module) {
        (globalThis as any).module = { 
          exports: (globalThis as any).exports 
        };
      }

      // Also add to window for broader compatibility
      if (!(window as any).exports) {
        (window as any).exports = (globalThis as any).exports;
      }
      
      if (!(window as any).module) {
        (window as any).module = (globalThis as any).module;
      }
    }
  }

  private static async importWithExportsCapture<T = any>(modulePath: string): Promise<T> {
    // Setup polyfills first
    this.setupGlobalPolyfills();

    // Clear any existing exports to start fresh
    const globalExports = (globalThis as any).exports;
    Object.keys(globalExports).forEach(key => delete globalExports[key]);

    try {
      // Import the module - this will populate the exports object
      const module = await import(modulePath);
      
      console.log(`Module ${modulePath} imported:`, {
        moduleKeys: Object.keys(module),
        exportsKeys: Object.keys(globalExports),
        moduleExports: module,
        globalExports: globalExports
      });

      // If the module has direct exports, use them
      if (Object.keys(module).length > 0) {
        return module;
      }

      // If no direct exports but global exports were populated, use those
      if (Object.keys(globalExports).length > 0) {
        return globalExports as T;
      }

      // If still no exports, try to get from module.exports
      const moduleExports = (globalThis as any).module?.exports;
      if (moduleExports && Object.keys(moduleExports).length > 0) {
        return moduleExports as T;
      }

      // Return the module as-is if nothing else worked
      return module;
    } catch (error) {
      console.error(`Failed to import ${modulePath}:`, error);
      throw error;
    }
  }

  static async loadGemsSDK() {
    try {
      console.log('🔄 Loading Gems SDK with CommonJS converter...');

      // Try main SDK path first
      try {
        const mainSDK = await this.importWithExportsCapture('@gems.fun/sdk');
        if (mainSDK.PumpClient) {
          console.log('✅ Found PumpClient in main SDK');
          return mainSDK.PumpClient;
        }
      } catch (error) {
        console.warn('Main SDK import failed:', error);
      }

      // Try direct client path
      try {
        const clientSDK = await this.importWithExportsCapture('@gems.fun/sdk/dist/clients/gemsfun');
        if (clientSDK.PumpClient) {
          console.log('✅ Found PumpClient in client SDK');
          return clientSDK.PumpClient;
        }
      } catch (error) {
        console.warn('Client SDK import failed:', error);
      }

      // Try clients index
      try {
        const indexSDK = await this.importWithExportsCapture('@gems.fun/sdk/dist/clients');
        if (indexSDK.PumpClient) {
          console.log('✅ Found PumpClient in clients index');
          return indexSDK.PumpClient;
        }
      } catch (error) {
        console.warn('Clients index import failed:', error);
      }

      throw new Error('PumpClient not found in any import path');
    } catch (error) {
      console.error('❌ Failed to load Gems SDK:', error);
      throw error;
    }
  }
}

export default CommonJSConverter;
